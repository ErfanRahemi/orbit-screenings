import os
import sys
import subprocess
import time
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import HTMLResponse

port = int(os.environ.get("PORT", 3000))

app = FastAPI(title="ORBIT Cinema Screenings API / Runner")

# Check if node server is running; if not, spawn it in background
node_process = None

def ensure_node_server():
    global node_process
    if node_process is None or node_process.poll() is not None:
        cmd = ["node", "server.js"]
        env = os.environ.copy()
        env["PORT"] = str(port)
        try:
            node_process = subprocess.Popen(cmd, env=env)
            time.sleep(2)
        except Exception as e:
            print(f"Error launching Node.js process: {e}")

@app.on_event("startup")
def startup_event():
    ensure_node_server()

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
async def proxy_to_nextjs(request: Request, path_name: str):
    ensure_node_server()
    client = httpx.AsyncClient(base_url=f"http://127.0.0.1:{port}", timeout=60.0)
    try:
        url = request.url.path
        if request.url.query:
            url += f"?{request.url.query}"
        body = await request.body()
        resp = await client.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
            content=body
        )
        return Response(content=resp.content, status_code=resp.status_code, headers=dict(resp.headers))
    except Exception as e:
        return HTMLResponse(
            f"<h3>ORBIT Screenings Server is starting up... Please refresh in a moment.</h3><p>{e}</p>",
            status_code=503
        )
    finally:
        await client.aclose()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
