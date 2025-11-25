import EditorJS, { type API } from "@editorjs/editorjs";

import Paragraph from "@editorjs/paragraph";
import { useEffect } from "react";
import ExtendedEditorjsImage from "../../src/index.ts";

function App() {
  useEffect(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      tools: {
        paragraph: Paragraph,
        extendedImage: {
          class: ExtendedEditorjsImage,
          config: {
            endpoints: {
              byFile: "http://localhost:3002/napp/uploads/kb/editor/image",
              // byUrl: "http://localhost:3002/napp/uploads/kb/editor/image",
            },
            additionalRequestHeaders: {
              Authorization: "Bearer bbf819f1-131a-44ac-a542-14e6702874ef",
            },
            toolboxTitle: "Paste Doc Image",
          },
          shortcut: "CMD+SHIFT+G",
        },
      },
      onChange: async (api: API) => {
        const content = await api.saver.save();
        console.log("Editor.js content", content);
      },
    });
  }, []);
  return (
    <div style={{ margin: "0 auto" }}>
      <h1>Editor.js Playground</h1>
      <div
        style={{
          width: "800px",
          border: "1px solid #e0e0e0",
        }}
        id="editorjs"
      ></div>
    </div>
  );
}

export default App;
