import * as vscode from 'vscode';
import { HelloWorldPanel } from './HelloWorldPanel';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  // console.log('Congratulations, your extension "vstodo" is now active!');

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "vstodo-sidebar",
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.helloWorld', () => {
      HelloWorldPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.refresh', async () => {
      // HelloWorldPanel.kill();
      // HelloWorldPanel.createOrShow(context.extensionUri);
      await vscode.commands.executeCommand("workbench.action.closeSidebar");
      await vscode.commands.executeCommand("workbench.view.extension.vstodo-sidebar-view");
      // setTimeout(() => {
      //   vscode.commands.executeCommand(
      //     'workbench.action.webview.openDeveloperTools'
      //   );
      // }, 500);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.askQuestion', async () => {
      const answer = await vscode.window.showInformationMessage(
        'How was your day?',
        'good',
        'bad'
      );
      if (answer === 'bad') {
        vscode.window.showInformationMessage('Sorry to hear that!');
      } else {
        console.log(answer);
        vscode.window.showInformationMessage('Good to hear that');
      }
    })
  );
}
export function deactivate() {}
