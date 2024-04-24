interface OpenAIRequestMessage {
  role: string;
  content: string;
}
interface OpenAIRequest {
  messages?: OpenAIRequestMessage[];
}

// Parse the prompt from the document
export const parsePrompt = (doc: string) => {
  const regex = /^===(user|assistant|system|sys|ai)===$/i;
  const dict = {
    user: "user",
    assistant: "assistant",
    system: "system",
    sys: "system",
    ai: "assistant",
  };

  let result: OpenAIRequest = {};
  const messages: OpenAIRequestMessage[] = [];
  let buf: string[] = [];
  let tag = "";

  const handleChunk = () => {
    const s = buf.join("\n");
    if (tag === "") {
      try {
        const obj = JSON.parse(s);
        if (obj) {
          result = { ...result, ...obj };
        } else {
          console.error("Invalid metadata", s);
        }
      } catch (e) {}
    } else {
      const s = buf.join("\n");
      messages.push({ role: dict[tag.toLowerCase()], content: s.trim() });
    }
    buf = [];
  };

  for (let line of doc.split("\n")) {
    line = line.trim();

    if (regex.test(line)) {
      if (buf.length > 0) {
        handleChunk();
      }
      tag = line.match(regex)?.[1] ?? "";
    } else {
      buf.push(line);
    }
  }

  if (tag && buf.length > 0) {
    handleChunk();
  }

  result.messages = (result.messages || []).concat(messages);
  return result;
};

export const formatPrompt = (req: OpenAIRequest) => {
  const { messages = [], ...rest } = req;
  const lines: string[] = [JSON.stringify(rest, null, 2)];

  const validRoles = ["user", "assistant", "system"];
  for (const msg of messages) {
    if (!validRoles.includes(msg.role)) {
      throw new Error(`Invalid role: ${msg.role}`);
    }
    lines.push(`===${msg.role}===\n${msg.content}`);
  }

  return lines.join("\n\n");
};
