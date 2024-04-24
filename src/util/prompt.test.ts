import { parsePrompt } from "./prompt";

test("parsePrompt", () => {
  const doc = `===metadata===
{"key": "value"}
===user===
User message 1
User message 2
===ai===
AI response 1
AI response 2
===sys===
System message 1
System message 2`;

  const parsed = parsePrompt(doc);
  expect(parsed).toEqual({
    messages: [
      { role: "user", content: "User message 1\nUser message 2" },
      { role: "ai", content: "AI response 1\nAI response 2" },
      { role: "sys", content: "System message 1\nSystem message 2" },
    ],
    key: "value",
  });
});
