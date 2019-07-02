#! /usr/bin/env node

const process = require("process");
const ArgumentParser = require("argparse").ArgumentParser;
const fs = require("fs");
const utils = require("util");

const exec = utils.promisify(require("child_process").exec);
const spawn = require("child_process").spawn;
const stat = utils.promisify(fs.stat);
const unlink = utils.promisify(fs.unlink);
const writeFile = utils.promisify(fs.writeFile);
const parser = ArgumentParser({
	version: 1.2,
	addHelp: true,
	description: "Tool to automaticaly deploy js to Pepper"
});

parser.addArgument(['--ip'], {help: "Ip of Pepper"});
parser.addArgument(['--app'], {
	help: "The Naoqi app's name",
	defaultValue: "R2019"
});

parser.addArgument(['--build-folder'], {
	help: "The folder to the react's build folder",
	dest: "buildFolder",
	defaultValue: "build"
});
parser.addArgument(['--user'], {help: "User for Pepper", defaultValue: "nao"});

const args = parser.parseArgs();

const {user, ip, app: appName, buildFolder} = args;

const COMMANDS_TEMP_FILE_NAME = "commands";

/**
 * @description Upload file using scp
 * @return {Promise<any>}
 * @param {string} user
 * @param {string} ip
 * @param {string} inputFile
 * @param {string} remoteFile
 */
function upload(user, ip, inputFile, remoteFile) {
	return new Promise(async (resolve, reject) => {
		
		const scp = spawn(`rsync`, ['-vz', '--progress', `${inputFile}`, `${user}@${ip}:${remoteFile}`], {stdio: 'inherit'});
		// const scp = spawn(`scp`, ['-p', '-v', `${inputFile}`, `${user}@${ip}:${remoteFile}`], {stdio: 'inherit'});
		parseIO(scp)
			.catch(error => reject(error))
			.then(data => resolve(data));
		
		
	})
	
}

function parseIO(spawn) {
	return new Promise((resolve, reject) => {
		const errors = [];
		spawn.on('close', (code, x) => {
			// console.log(`child process exited with code ${code} ${x}\n`);
			if (errors.length > 0) {
				reject(errors)
			} else {
				resolve();
			}
		});
	});
	
}

/**
 *
 * @param {string} user: user to connect on pepper
 * @param {string} ip: ip of Pepper
 * @param {string} wd: working directory for the command
 * @param {string} command: the command to run on Pepper.
 * @return {Promise}
 */
function remoteCommand(user, ip, wd = "~", command) {
	return new Promise(async (resolve, reject) => {
		
		if (wd !== "") {
			command = `cd ${wd} && ${command}`
		}
		// const ssh = spawn(`echo "${command}" | ssh ${user}@${ip}`);
		const ssh = spawn(`ssh`, [`${user}@${ip}`, `\`${command}\``, {stdio: 'inherit'}]);
		// console.debug(`echo "${command}" | ssh ${user}@${ip}`);
		
		parseIO(ssh).catch(error => {
			// console.error('Error in remoteCommand', error);
			reject(error)
		}).then(result => {
			// console.log("OK with remoteCommand", result);
			resolve(result)
		});
	});
}

function main() {
	if (ip) {
		
		console.log(`\nStart to compress ${buildFolder} folder`);
		console.time("Compressing");
		const tarEd = `${buildFolder}.tar`;
		
		stat(buildFolder).catch(async e => {
			if (e.code === 'ENOENT') {
				console.log("No build folder to send, start to build one");
				console.time("build");
				let build = spawn("npm run build");
				await parseIO(build);
				console.timeEnd("build")
				
			} else {
				process.exit(1)
			}
		}).finally(async () => {
			await exec(`tar cf ${tarEd} ${buildFolder}`);
			console.timeEnd("Compressing");
			
			console.log(`\nUpload to ${ip}`);
			const path = `/home/nao/.local/share/PackageManager/apps/${appName}`;
			console.log("the build folder will be deployed to " + path);
			await remoteCommand(user, ip, "", `mkdir ${path}`);
			await upload(user, ip, tarEd, path);
			
			console.log('\n');
			console.time(`Extract on ${ip}`);
			
			// Extract and clean on Pepper
			
			let commands = `tar xvf ${path}/${tarEd} -C ${path}` + '\n' +
				`rm -r ${path}/html\n` +
				`rm  ${path}/${tarEd}\n` +
				`mv ${path}/${buildFolder} ${path}/html`;
			
			await writeFile(COMMANDS_TEMP_FILE_NAME, commands);
			await remoteCommand(user, ip, "", commands);
			console.timeEnd(`Extract on ${ip}`);
			
			// Clean local files
			await unlink(COMMANDS_TEMP_FILE_NAME);
			await unlink(tarEd);
			
			
			console.log("Everything is ok");
		});
		
		
	} else {
		console.error("No ip provided please use flag --ip or see --help")
	}
	
	
}

main();


