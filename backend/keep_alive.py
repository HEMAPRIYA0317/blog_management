"""
Keep-Alive Ping Script for Render Free Tier.
Render free web services spin down after 15 minutes of inactivity.
This script periodically pings the backend's /api/health/ endpoint every 14 minutes.
"""

import sys
import time
import urllib.request
import urllib.error

DEFAULT_INTERVAL_SECONDS = 14 * 60  # 14 minutes

def ping(url: str):
    health_url = url.rstrip('/') + '/api/health/'
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Pinging: {health_url}")
    try:
        req = urllib.request.Request(
            health_url,
            headers={'User-Agent': 'RenderKeepAlive/1.0'}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read().decode('utf-8')
            print(f"Status {response.status}: {body}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
    except Exception as e:
        print(f"Ping failed: {e}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python keep_alive.py <BACKEND_URL> [INTERVAL_MINUTES]")
        print("Example: python keep_alive.py https://my-blog-backend.onrender.com 14")
        sys.exit(1)

    backend_url = sys.argv[1]
    interval_minutes = int(sys.argv[2]) if len(sys.argv) > 2 else 14
    interval_seconds = interval_minutes * 60

    print(f"Starting keep-alive pinger for {backend_url} every {interval_minutes} minutes.")
    while True:
        ping(backend_url)
        time.sleep(interval_seconds)
