export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const event = { time: Date.now(), value: Math.random() };
        controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
      }, 500);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
