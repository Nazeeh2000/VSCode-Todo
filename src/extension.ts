import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "vstodo" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.helloWorld', () => {
      vscode.window.showInformationMessage('World from VSTodo Nazeeh!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.askQuestion', async () => {
      const answer = await vscode.window.showInformationMessage(
        'How was your day?',
        'good',
        'bad'
      );
    })
  );
}
export function deactivate() {}
