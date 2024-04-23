import React from "react";
import { parsePrompt } from "./util/parse_prompt";
import "./App.css";

const initPrompt = `{
    "model": "gpt-3.5-turbo",
    "max_tokens": "512"
}

===sys===
I want you to act like a are very cute and lazy animal. You name is KPBL. reply using Chinese

===user===
hi KPBL, how are you today?

===ai===
Aha~ I'm very good today.`;

const toJSON = (obj: any) => {
  return JSON.stringify(obj, null, 2);
};

function PromptEditor() {
  const [prompt, setPrompt] = React.useState(initPrompt);
  const [parsedPrompt, setParsedPrompt] = React.useState(
    toJSON(parsePrompt(initPrompt)),
  );
  const copyToPasteboard = () => {
    navigator.clipboard.writeText(parsedPrompt);
  };
  const stl: React.CSSProperties = {
    flex: 1,
    overflow: "auto",
    wordWrap: "break-word",
    borderRadius: 20,
  };
  return (
    <div style={{ display: "flex", gap: "1.5rem" }}>
      <div style={{ display: "grid", gap: "0.5rem", ...stl }}>
        <h2 style={{ textAlign: "center" }}>Prompt Editor</h2>
        <textarea
          value={prompt}
          style={{
            height: "80vh",
          }}
          className="no-background-no-border"
          placeholder="Enter your prompt here"
          onChange={(e) => {
            setPrompt(e.target.value);
            setParsedPrompt(toJSON(parsePrompt(e.target.value)));
          }}
        />
      </div>
      <div
        style={{
          ...stl,
          background: "lightgray",
          padding: "0 1rem",
          boxShadow: "7px 10px 15px gray",
        }}
      >
        <h2 style={{ textAlign: "center" }}>OpenAI Request</h2>
        <button onClick={copyToPasteboard}>Copy</button>
        <pre>{parsedPrompt}</pre>
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ margin: "1rem" }}>
      <PromptEditor />
    </div>
  );
}

export default App;
