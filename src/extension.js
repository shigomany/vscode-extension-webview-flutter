// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const buildPath = 'build';
var _ui = null;

function activate(context) {


	let disposable = vscode.commands.registerCommand('arb-part-vscode.open', function () {
		// vscode.window.showInformationMessage('Hello World from arb-part-vscode!');

		const ui = vscode.window.createWebviewPanel('arb-part-ui', 'ARB Part UI', vscode.ViewColumn.One,
			{
				enableScripts: true,
				// retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.joinPath(context.extensionUri, buildPath),
				]
			});
		_ui = ui;
		_ui.onDidDispose(() => {
			_ui = null;
		});
		setFlutterUI(context);
		// setTimeout(() => {
		// 	setFlutterUI(context);
		// }, 5000);
	});

	context.subscriptions.push(disposable);
}

function setFlutterUI(context) {

		const targetScripts = ['flutter.js', 'main.dart.js', 'flutter_service_worker.js'];
		let uiHtml = fs.readFileSync(path.join(context.extensionPath, buildPath, 'index.html'))
		.toString();
		for (const el of targetScripts) {
			console.log(el);
			const onDiskPath = vscode.Uri.joinPath(context.extensionUri, buildPath, el);
			const onDiskUri = _ui.webview.asWebviewUri(onDiskPath).toString();
			uiHtml = uiHtml.replace(el, onDiskUri);
		}
		const onDiskPath = vscode.Uri.joinPath(context.extensionUri, buildPath);
		const onDiskUrl = _ui.webview.asWebviewUri(onDiskPath);
		// uiHtml = uiHtml.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">${metaTag(_ui.webview.cspSource)}`);
		uiHtml = uiHtml.replace('<base href="/">', `<base href="${onDiskUrl}/">`);
		_ui.webview.html = uiHtml;
		console.log(onDiskPath);
	
}

function metaTag(cspSource) {
	return `<meta http-equiv="Content-Security-Policy" content="
		default-src 'none';
		script-src 'unsafe-inline' ${cspSource} vscode-webview:;
		style-src ${cspSource}; 
		img-src ${cspSource} https:;
	">`;
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
