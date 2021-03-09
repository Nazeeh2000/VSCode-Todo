import * as vscode from 'vscode';
import { authenticate } from './authenticate';
import { HelloWorldPanel } from './HelloWorldPanel';
import { SidebarProvider } from './SidebarProvider';
import { TokenManager } from './TokenManager';

export function activate(context: vscode.ExtensionContext) {
  // console.log('Congratulations, your extension "vstodo" is now active!');

  TokenManager.globalState = context.globalState;
  

  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  item.text = '$(add) Add todo';
  item.command = 'vstodo.addTodo';
  item.show();

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vstodo-sidebar', sidebarProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.helloWorld', () => {
      vscode.window.showInformationMessage('token value is: ' + TokenManager.getToken());
      // HelloWorldPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.authenticate', () => {
      try {
        authenticate();
      } catch (err) {
        console.log(err);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.addTodo', () => {
      const { activeTextEditor } = vscode.window;

      if (!activeTextEditor) {
        vscode.window.showInformationMessage('No active text editor');
        return;
      }

      const text = activeTextEditor.document.getText(
        activeTextEditor.selection
      );

      vscode.window.showInformationMessage('Text: ' + text);
      sidebarProvider._view?.webview.postMessage({
        type: 'new-todo',
        value: text,
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vstodo.refresh', async () => {
      // HelloWorldPanel.kill();
      // HelloWorldPanel.createOrShow(context.extensionUri);
      await vscode.commands.executeCommand('workbench.action.closeSidebar');
      await vscode.commands.executeCommand(
        'workbench.view.extension.vstodo-sidebar-view'
      );
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
