"""Limitador en memoria (ventana deslizante, un solo proceso, sin dependencias)."""
import time
from collections import deque

from fastapi import Request


def client_ip(request: Request) -> str:
    """IP real del cliente. Detrás de Caddy es el ÚLTIMO valor de
    X-Forwarded-For (el que escribe el proxy); sin proxy, la del socket."""
    partes = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
    if partes:
        return partes[-1]
    return request.client.host if request.client else "unknown"


class SlidingWindowLimiter:
    """Permite como máximo `limit` intentos por `window` segundos para cada clave."""

    def __init__(self, limit: int, window: float = 60.0, clock=time.monotonic):
        self.limit = limit
        self.window = window
        self._clock = clock
        self._hits = {}
        self._last_purge = clock()

    def hit(self, key: str) -> bool:
        """Registra un intento. True si se permite, False si pasó el límite
        (los rechazados no cuentan)."""
        now = self._clock()
        if now - self._last_purge >= self.window:
            self._purge(now)
        cutoff = now - self.window
        q = self._hits.setdefault(key, deque())
        while q and q[0] <= cutoff:
            q.popleft()
        if len(q) >= self.limit:
            return False
        q.append(now)
        return True

    def _purge(self, now: float) -> None:
        """Borra claves sin intentos recientes para que el dict no crezca sin fin."""
        cutoff = now - self.window
        for key in [k for k, q in self._hits.items() if not q or q[-1] <= cutoff]:
            del self._hits[key]
        self._last_purge = now

    def reset(self) -> None:
        self._hits.clear()
        self._last_purge = self._clock()
