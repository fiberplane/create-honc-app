- Implement centralized error handling

app.onError((error, c) => {
  console.error(error);

  // Handle formatted errors thrown by app or hono
  if (error instanceof HTTPException) {
    let issues: Record<string, string[]> | undefined = undefined;
    if (error.cause instanceof Error && isZodError(error.cause)) {
      issues = formatZodError(error.cause);
    }

    return c.json(
      {
        message: error.message,
        ...(issues && { issues }),
      },
      error.status,
    );
  }

  return c.json(
    {
      message: "Something went wrong",
    },
    500,
  );
});