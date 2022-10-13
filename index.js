const fs = require('fs');
const config = require("./config.js");
function tickler(){
	let fls = fs.readdirSync(__dirname+config["source"]);
	let rls = [];
	const singles = [
		"link",
		"img",
		"br",
		"input",
		"meta"
	];
	for(var i in fls){
		if(fls[i].indexOf(".bg5")){
			rls.push(fls[i]);
		}
	}
	for(var i in rls){
		let s = fs.readFileSync(__dirname+config["source"]+"/"+rls[i], "utf-8");
		s = conversion(s.split("\n"));
		let f = __dirname+config["target"]+"/";
		f+=rls[i].replace(".bg5", ".html");
		fs.writeFileSync(f, s);
	}
	const elict = function (e,l,i){
		let r = `Fatal execption: ${e}`;
		r+=`\nOn line ${l} index ${i}`;
		console.error(r);
		process.exit();
	}
	function conversion(s){
		let input = s;
		let nest = [];
		let out = [
			"<!DOCTYPE html>"
		];
		for(var i in input){
			let l = input[i];
			let mode = "tg-def";
			let data = {};
			let tgn = "";
			let tag = "<";
			let end = true;
			for(var k in l){
				var c = l[k];
				if(c == "("){
					tag +=" ";
					mode = "tg-n-d";
					continue;
				} else if (c == ":"){
					if(mode == "tg-n-d"){
						tag += `="`;
						mode = "tg-d-d";
						continue;
					} else {
						tag += ">"
						mode = "tx-d";
						continue;
					}
				} else if (c == ")"){
					if(mode == "tg-d-d"){
						tag+=`"`;
						mode = "tx-d";
						if(l.length-1 == k){
							tag+=">";
						}
					}
				} else if(c == "%"){
					if(l.length-1 == k){
						nest.push(tgn);
						tag+=">";
						end = false;
					} else if (k == 0){
						tag = "</";
						end = 3;
					}
				} else if(c == "/" && k == 0){
					mode = "comment";
					tag = "<!--";
					end = 3;
				} else {
					if(mode == "tg-def"){
						tag+=c;
						tgn+=c;
					} else if(mode == "tg-n-d"){
						tag+=c;
					} else if(mode == "tg-d-d"){
						tag+=c;
					} else if(mode == "tx-d"){
						tag+=c;
					} else if(mode == "comment"){
						if(c!="/")tag+=c;
					} else {
						console.log(mode);
					}
				}
				if(l.length-1 == k && mode == "tg-def" && end == true){
					tag+=">"
				}
				if(l.length-1 == k && mode == "comment"){
					tag+="--";
				}
				if(l.length-1 == k && end == true && singles.indexOf(tgn) == -1){
					tag+="</"+tgn+">"
				} else if(l.length-1 == k && end == 3){
					tag+=">";
				}
				if(l.length-1 == k){
					out.push(tag);
				}
			}
		}
		out=out.join("\n");
		//console.log(out);
		//console.log(`Saved ${out.length-input.length} charaters, ${(((out.length-input.length)/out.length)*100).toFixed(2)}%`);
		return out;
	}
}
(async function(){
	while(1){
		tickler();
		await new Promise(resolve => setTimeout(resolve, 2000));
	}
})();


