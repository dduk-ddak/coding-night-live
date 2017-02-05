// simplemde (left div: editing text area)
cnl_globals.editor = new SimpleMDE({
  element: document.getElementById("code"),
  autofocus: true,
  spellChecker: true,
  forceSync: true,
  lineNumbers: true,
  toolbarTips: false,
  promptURLs: false,
  insertTexts: {
    image: ["![enter image description here](http://", ")"],
    link: ["[enter link description here](http://", ")"],
    horizontalRule: ["", "\n\n-----\n\n"],
    table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
  },
  toolbar: ["bold", "italic", "strikethrough", "heading", "|",
  "code", "quote", "horizontal-rule", "|",
  "ordered-list", "unordered-list", "table", "|",
  "link", "image", "|",
  "guide"],
});
cnl_globals.editor.codemirror.on("change", function(e) {
  cnl_slides.setSlideText(e.getValue());
});
