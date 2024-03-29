//BINGLE5 TRANSPILER
//Bingle5 (designed by me) is a simple markup language that stives to achive the same output with less input
//This example takes a directory of Bingle5 files and transpiles them to HTML files


//import the built-in file system module
const fs = require('fs');
//define cache for lastmodified times
let cache = {};
function transpile(source_dir, out_dir){
	//read files from target directory
	let fls = fs.readdirSync(source_dir);
	//list of files to be transpiled
	let rls = [];
	//select only bg5 files into rls
	for(var i in fls){
		if(fls[i].indexOf(".bg5")){
			rls.push(fls[i]);
		}
	}
	//interate through the files and execute the transpilation
	for(let i in rls){
		//get the fully qualified file path
		let ri = source_dir+"/"+rls[i];
		//check if file lastmodfied time is different from the cache
		if(fs.statSync(ri)["mtime"].getTime() != cache[ri]){
			//cache miss, update cache and continue execution
			cache[ri] = fs.statSync(ri)["mtime"].getTime();
		} else {
			//cache matches, skip
			continue;
		}
		//read the file into a string
		let s = fs.readFileSync(ri, "utf-8");
		//transpile the file as an array of lines
		s = conversion(s.split("\n"));
		//create the fully qualified output file path (modify the extension)
		let f = out_dir+"/"+(rls[i].replace(".bg5", ".html"));
		//write the transpiled content to the output file
		fs.writeFileSync(f, s);
	}
}

function conversion(s){
	//list of single tags that do not have an end tag
	const singles = [
		"link",
		"img",
		"br",
		"input",
		"meta",
		"source"
	];
	//initialize the input (array of lines)
	let input = s;
	//initialize the nest stack
	let nest = [];
	//initialize the output (array of lines) with the doctype
	let out = [
		"<!DOCTYPE html>",
		"<html>"
	];
	//iterate through the input lines
	for(let i in input){
		//get the current line
		let l = input[i];
		//initialize the mode to "tag definition" because the start of each line is a tag definition
		let mode = "tg-def";
		//initialize the data object
		let data = {};
		//initialize the tag name to empty
		let tgn = "";
		//initialize the tag to "<"
		let tag = "<";
		//initialize the end flag to true
		let end = true;
		//iterate through the characters of the line
		for(let k in l){
			//get the current character
			let c = l[k];
			
			//the first few conditions will determine if the character is one with a function
			//they all share the l[k-1] != "\\" condition that checks if the previous character is an escape character (backslash)
			//if the previous character is an escape character, the current character is not a function character and will fall through to the else condition

			//if the character is an opening parenthesis to define a tag attribute
			if(c == "(" && l[k-1] != "\\"){
				//add a space to the tag
				tag +=" ";
				//switch to tag attribute name definition mode
				mode = "tg-n-d";
				//skip to the next character
				continue;
			//if the character is a colon to define a tag attribute value or element content
			} else if(c == ":" && l[k-1] != "\\"){
				if(mode == "tg-n-d"){
					//add an equals sign to the tag
					tag += `="`;
					//switch to tag attribute value definition mode
					mode = "tg-d-d";
					//skip to the next character
					continue;
				} else {
					//close the tag and switch to text content mode
					tag += ">"
					mode = "tx-d";
					//skip to the next character
					continue;
				}
			//if the character is a closing parenthesis to close a tag attribute value
			} else if(c == ")" && l[k-1] != "\\"){
				if(mode == "tg-d-d"){
					//close the tag attribute value and switch to text content mode
					tag+=`"`;
					mode = "tx-d";
					//if the current character is the last character in the line, close the tag
					if(l.length-1 == k){
						tag+=">";
					}
				}
			//if the character is a percent sign to close a tag
			} else if(c == "%" && l[k-1] != "\\"){
				//if the current character is the last character in the line
				if(l.length-1 == k){
					//push the tag name to the nest stack
					nest.push(tgn);
					//close the tag
					tag+=">";
					//set the end flag to false
					end = false;
				//if the current character is the first character in the line
				} else if (k == 0){
					//switch to closing tag mode
					tag = "</";
					//set the end flag to 3
					end = 3;
				}
			//if the character is a forward slash to define a comment (and first character in the line)
			} else if(c == "/" && k == 0){
				//switch to comment mode
				mode = "comment";
				//set the tag to "<!--"
				tag = "<!--";
				//set the end flag to 3
				end = 3;
			//if the character is not a function character
			} else {
				//now we check the mode to determine what to do with the character
				if(mode == "tg-def"){
					//if the mode is tag definition, add the character to the tag name and tag
					tag+=c;
					tgn+=c;
				} else if(mode == "tg-n-d"){
					//if the mode is tag attribute name definition, add the character to the tag
					if(c!="\\")tag+=c;
					//if the character is an escape character, add it to the tag
					if(c=="\\" && l[k-1] == "\\")tag+=c;
				} else if(mode == "tg-d-d"){
					//if the mode is tag attribute value definition, add the character to the tag
					if(c!="\\")tag+=c;
					//if the character is an escape character, add it to the tag
					if(c=="\\" && l[k-1] == "\\")tag+=c;
				} else if(mode == "tx-d"){
					//if the mode is text content definition, add the character to the tag
					if(c!="\\")tag+=c;
					//if the character is an escape character, add it to the tag
					if(c=="\\" && l[k-1] == "\\")tag+=c;
				} else if(mode == "comment"){
					//if the mode is comment, add the character to the tag
					if(c!="/")tag+=c;
				} else {
					//if the mode is not recognized, log the mode
					console.log(mode);
				}
			}
			//if the current character is the last character in the line and the mode is tag definition and the end flag is true
			if(l.length-1 == k && mode == "tg-def" && end == true){
				//close the tag
				tag+=">"
			}
			//if the current character is the last character in the line and the mode is comment
			if(l.length-1 == k && mode == "comment"){
				//close the tag
				tag+="--";
			}
			//if the current character is the last character in the line and the end flag is true and the tag name is not in the singles list
			if(l.length-1 == k && end == true && singles.indexOf(tgn) == -1){
                tag+="</"+tgn+">"
			//if the current character is the last character in the line and the end flag is true and the tag name is in the singles list
            } else if(l.length-1 == k && end == 3){
                tag+=">";
            }
			//if the current character is the last character in the line and the mode is tag definition and the end flag is true
            if(l.length-1 == k){
                out.push(tag);
            }
		}
	}
	//add the closing html tag
	out.push("</html>");
	//convert the output array to a string
	out = out.join("\n");
	//print saved characters metrics
    console.log(`Saved ${out.length-input.length} charaters, ${(((out.length-input.length)/out.length)*100).toFixed(2)}%`);
	//return the output string
	return out;
}

transpile(__dirname+"/public_dev", __dirname+"/public");
