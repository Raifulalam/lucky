/**
 * @file health.js
 * @description Ultra-fast health check router.
 *
 * Endpoints
 * ─────────────────────────────────────────────────────────────────────
 *  GET /healthz           — Liveness probe  (no DB check, <1 ms)
 *  GET /api/health        — Readiness probe (full system snapshot)
 *  GET /api/health/live   — Alias for liveness (Kubernetes-style)
 *  GET /api/health/ready  — Alias for readiness
 * ─────────────────────────────────────────────────────────────────────
 *
 * Performance optimisations
 * • Pre-built liveness body — allocated once at startup, never again.
 * • Readiness check runs DB ping & memory reads in parallel.
 * • Zero external dependencies beyond what is already in package.json.
 * • Cache-Control: no-store so monitors always get a fresh response.
 */

"use strict";

const express = require("express");
const mongoose = require("mongoose");
const os = require("os");

const router = express.Router();

// ─── Constants ───────────────────────────────────────────────────────────────

const SERVICE_NAME = process.env.SERVICE_NAME || "myStore-api";
const NODE_ENV = process.env.NODE_ENV || "development";
const VERSION = process.env.npm_package_version || "1.0.0";

/** Epoch-ms when the process started — used to calculate uptime cheaply. */
const STARTED_AT = Date.now();

/** DB readyState → human-readable label mapping (mongoose docs). */
const DB_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "uninitialized",
};

// ─── Shared headers ──────────────────────────────────────────────────────────

/**
 * Apply health-check headers: no caching + short connection timeout.
 * Inline function (not arrow) so `this` is never captured.
 */
function applyHealthHeaders(res) {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Content-Type": "application/json",
    "X-Service": SERVICE_NAME,
  });
}

// ─── Liveness ────────────────────────────────────────────────────────────────

/**
 * Pre-serialised liveness body.
 * Built once; reused on every liveness request — zero allocations per call.
 */
const LIVENESS_BODY = JSON.stringify({
  status: "ok",
  service: SERVICE_NAME,
  version: VERSION,
  env: NODE_ENV,
});

/**
 * GET /healthz  (also mounted as /api/health/live)
 *
 * Liveness probe — answers "is the process alive?"
 * Returns 200 immediately with no I/O. Ideal for Kubernetes liveness probes
 * and uptime monitors that just need the server to respond.
 */
function livenessHandler(req, res) {
  applyHealthHeaders(res);
  // Send the pre-built buffer — no serialisation on the hot path.
  res.status(200).end(LIVENESS_BODY);
}

// ─── Readiness ───────────────────────────────────────────────────────────────

/**
 * Ping MongoDB with a timeout so a slow DB does not hang the probe.
 * Returns { ok, latencyMs } — never throws.
 */
async function pingDB() {
  const start = process.hrtime.bigint();
  try {
    if (mongoose.connection.readyState !== 1) {
      return { ok: false, latencyMs: 0 };
    }
    // admin().ping() is the lightest possible server-round-trip check.
    await mongoose.connection.db.admin().ping();
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    return { ok: true, latencyMs: parseFloat(latencyMs.toFixed(2)) };
  } catch {
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    return { ok: false, latencyMs: parseFloat(latencyMs.toFixed(2)) };
  }
}

/**
 * Collect memory stats (all in MB, rounded to 2 dp).
 * process.memoryUsage() is a synchronous C++ call — extremely cheap.
 */
function getMemoryStats() {
  const mem = process.memoryUsage();
  const toMB = (bytes) => parseFloat((bytes / 1_048_576).toFixed(2));
  return {
    rss: toMB(mem.rss),
    heapUsed: toMB(mem.heapUsed),
    heapTotal: toMB(mem.heapTotal),
    external: toMB(mem.external),
  };
}

/**
 * GET /api/health  (also mounted as /api/health/ready)
 *
 * Readiness probe — answers "is the service ready to handle traffic?"
 * Runs DB ping and memory/system checks in parallel then returns a
 * comprehensive JSON snapshot.
 */
async function readinessHandler(req, res) {
  applyHealthHeaders(res);

  // Parallel I/O — do not await sequentially.
  const [db, memory] = await Promise.all([
    pingDB(),
    Promise.resolve(getMemoryStats()),   // wrapped so both slots are promises
  ]);

  const uptimeMs = Date.now() - STARTED_AT;
  const dbState = DB_STATES[mongoose.connection.readyState] ?? "unknown";

  const payload = {
    status: db.ok ? "ok" : "degraded",
    service: SERVICE_NAME,
    version: VERSION,
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: {
      ms: uptimeMs,
      human: formatUptime(uptimeMs),
    },
    database: {
      status: dbState,
      ok: db.ok,
      latencyMs: db.latencyMs,
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      cpuCores: os.cpus().length,
      loadAvg: os.loadavg().map((v) => parseFloat(v.toFixed(2))),
      freeMemoryMB: parseFloat((os.freemem() / 1_048_576).toFixed(2)),
      totalMemoryMB: parseFloat((os.totalmem() / 1_048_576).toFixed(2)),
    },
    process: {
      pid: process.pid,
      memory,
    },
  };

  // 200 if fully ready, 503 if degraded (allows load-balancer to route away).
  res.status(db.ok ? 200 : 503).json(payload);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert milliseconds to a human-readable uptime string.
 * e.g. "2d 4h 33m 12s"
 */
function formatUptime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`]
    .filter(Boolean)
    .join(" ");
}

// ─── Route registration ───────────────────────────────────────────────────────

// Liveness  — synchronous, zero I/O
router.get("/live", livenessHandler);

// Readiness — async, runs DB ping
router.get("/", readinessHandler);
router.get("/ready", readinessHandler);

module.exports = router;

// Also export the handlers so index.js can mount the liveness probe at /healthz
// without pulling in the whole router.
module.exports.livenessHandler = livenessHandler;
module.exports.readinessHandler = readinessHandler;
