// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState();
  console.log('Hello there from javascript');
  // const button = document.getElementById('button');
  // button.innerText = 'hello from javascript';
})();
