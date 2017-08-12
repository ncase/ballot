// use the function createKernelYee to construct the kernel functions (which takes some time)
// it returns a function fastyee, which can be run
// variables can change and the same function can be used
// but if the dimensions of the kernel change, then the kernel has to be re-created.

// old instructions
// // use the functions
// // cubeCandidateToWinner
// // cubeVoterToWinner
// // to get a list of winners
// // The input is which object to move, 
// // what the current object positions are, and 
// // what the pixel size and number of pixels vertical and horizontal

// // function cubeCandidateToWinner(xv,yv,xc,yc,f,lf,candidatetomove,pixelsize,liy,lix){
// // function cubeVoterToWinner(xv,yv,xc,yc,f,lf,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix){




// comment this out when running as a script

function createKernelYee(lc,lv,WIDTH,HEIGHT,pixelsize) {
	lix = WIDTH / pixelsize
	liy = HEIGHT / pixelsize
	// set some globals
	li = lix * liy
// this part




runscript = false
var onlylast = false
//docubevc = true

var li,lv,lc

if(runscript){

var left = document.getElementById('left')
var right = document.getElementById('right')
}
const gpu = new GPU();

if(runscript){

left.innerHTML += gpu.getMode()
left.innerHTML += 'left is gpu output. right is true values.'
right.innerHTML += gpu.getMode()
right.innerHTML += 'left is gpu output. right is true values.'




// i is instances
// v is voters
// c is candidates
// l is a prefix for length of array

// there are three constructors here to make the datasets.
// 1. random voter and candidate positions
// 2. raster a group of voters
// 3. raster a candidate

// make variables

// comment these out since we get them fron the function
// var lc = 5
// var lv = 2
// var li = 10 // 400

var xf = []
for (i =0;i<lc;i++) xf.push(Math.random())
var xv=[]
for (i =0;i<li;i++) {
	var da = []
	for (j =0;j<lv;j++) da.push(Math.random())
	xv.push(da)
}
var yv=xv
var yf=xf

// for now,
var xc = xf
var yc = yf

// also f is a list of indices of the frontrunners e.g. [1,3]
f = [1,3]
lf = f.length
}





const d = gpu.createKernel( function(xv, yv, xf, yf) {
	var civ,i,v,c,d,dx,dy,ci
	civ = this.thread.x
	v = Math.floor((civ) / (lc*li)); // z
	//v = civ / (lc*lv) >> 0
	ci = civ - v * lc * li
	//ci = civ % (lc*li)
	i = Math.floor((ci) / lc)
	//i = Math.floor(civ/lc)%li
	//i = tmp / lc >> 0; // y
	c = ci % lc; // x
	//c=civ%lc
	// d is indexed as civ

	dx = xv[i][v] - xf[c]
	dy = yv[i][v] - yf[c]
	d = Math.sqrt(dx*dx + dy*dy)
	return d
}, {
	dimensions: [lv*lc*li], // y,x
	constants: {lv:lv,lc:lc,li:li}
})


if(runscript){

var cube = d(xv, yv, xf, yf)
//left.innerHTML += "<br>"+cube

left.innerHTML += "<br>"+"cube"
left.innerHTML += "<br>"+cube.slice(0,100).join("<br>")
right.innerHTML += "<br>"+"cube"
}
function dJ(xv,yv,xf,yf,lc,li,lv) {
var cube=[]
var civ,i,v,c,d,dx,dy,ci
for (var civ=0; civ<lc*li*lv; civ++) {
	v = Math.floor((civ) / (lc*li)); // z
	//v = civ / (lc*lv) >> 0
	ci = civ - v * lc * li
	//ci = civ % (lc*li)
	i = Math.floor((ci) / lc)
	//i = Math.floor(civ/lc)%li
	//i = tmp / lc >> 0; // y
	c = ci % lc; // x
	//c=civ%lc
	// d is indexed as civ

	dx = xv[i][v] - xf[c]
	dy = yv[i][v] - yf[c]
	d2 = Math.sqrt(dx*dx + dy*dy)
	right.innerHTML += "<br>"+d2
	cube.push(d2)
}
return cube
}

if(runscript){

cube =  dJ(xv,yv,xf,yf,lc,li,lv)

}








if(runscript){

// make grid of instances, i
WIDTH = 300
HEIGHT = 300
pixelsize = 30
lix = WIDTH / pixelsize // called density
liy = HEIGHT / pixelsize
li = lix * liy










var xc=xf
var yc=yf


votergrouptomove = 0 // edit this
vg = [] // which group does the voter belong to?
nvg = 3 // how many voter groups are there?
for (j =0;j<lv;j++) vg.push(Math.floor(nvg*Math.random()))
xvcenter = []
for (j =0;j<nvg;j++) xvcenter.push(Math.random())
yvcenter = xvcenter
}
const cubeVoter = gpu.createKernel( function(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix){
	var civ,i,v,c,d,dx,dy,ci,xnewv,ynewv,xnewvcenter,ynewvcenter

	civ = this.thread.x
	v = Math.floor(civ / (lc*li))
	ci = civ - v * lc * li
	i = Math.floor((ci) / lc)
	c = ci % lc; // x


	if (vg[v]==votergrouptomove){
		xnewvcenter = pixelsize * (i / liy) // rounding is actually done in the gpu.js code, so I don't actually need it here.  otherwise I would put a Math.round on this
		ynewvcenter = pixelsize * (i % liy)
		// next, shift the center to this new center
		xnewv = xv[v] + (xnewvcenter - xvcenter[votergrouptomove])
		ynewv = yv[v] + (ynewvcenter - yvcenter[votergrouptomove])
	} else {
		xnewv = xv[v]
		ynewv = yv[v]
	}
	dx = xc[c] - xnewv
	dy = yc[c] - ynewv
	d = Math.sqrt(dx*dx + dy*dy)
	return d
}, {
	dimensions: [lv*lc*li], // y,x
	constants: {lv:lv,lc:lc,li:li}
})

cubeVoterJ = function(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix,c,li,lv){
var cube = []
var civ,i,v,c,d,dx,dy,ci,xnewv,ynewv,xnewvcenter,ynewvcenter
for (var civ = 0; civ < li*lv*lc ; civ++) {
	
	v = Math.floor(civ / (lc*li))
	ci = civ - v * lc * li
	i = Math.floor((ci) / lc)
	c = ci % lc; // x


	if (vg[v]==votergrouptomove){
		xnewvcenter = pixelsize * (i / liy) // rounding is actually done in the gpu.js code, so I don't actually need it here.  otherwise I would put a Math.round on this
		ynewvcenter = pixelsize * (i % liy)
		// next, shift the center to this new center
		xnewv = xv[v] + (xnewvcenter - xvcenter[votergrouptomove])
		ynewv = yv[v] + (ynewvcenter - yvcenter[votergrouptomove])
	} else {
		xnewv = xv[v]
		ynewv = yv[v]
	}
	dx = xc[c] - xnewv
	dy = yc[c] - ynewv
	d = Math.sqrt(dx*dx + dy*dy)
	cube.push(d)
}
return cube
}


if(runscript){

cubeV = cubeVoter(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix)


left.innerHTML += "<br>"+"cubeV"
left.innerHTML += "<br>"+cubeV.slice(0,100).join("<br>")








candidatetomove = 0 // edit this

var notcandidatetomove = []
var boolcanmove = []
for (i =0;i<lc;i++) {notcandidatetomove.push(i); boolcanmove.push(0) }
notcandidatetomove.splice(candidatetomove,1)
boolcanmove[candidatetomove]=1
}
const cubeCandidate = gpu.createKernel( function(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix){
	var civ,i,v,c,d,dx,dy,ci,xnewc,ynewc

	civ = this.thread.x
	v = Math.floor(civ / (lc*li))
	ci = civ - v * lc * li
	i = Math.floor((ci) / lc)
	c = ci % lc; // x

	//xnewc = xc[c] * (1-boolcanmove[c]) + xmoved * boolcanmove[c]
	if (c==candidatetomove){
		xnewc = pixelsize * (i / liy) // rounding is actually done in the gpu.js code, so I don't actually need it here.  otherwise I would put a Math.round on this
		ynewc = pixelsize * (i % liy)
	} else {
		xnewc = xc[c]
		ynewc = yc[c]
	}
	dx = xv[v] - xnewc
	dy = yv[v] - ynewc
	d = Math.sqrt(dx*dx + dy*dy)
	return d
}, {
	dimensions: [lv*lc*li], // y,x
	constants: {lv:lv,lc:lc,li:li}
})

cubeCandidateJ = function(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix,lc,li,lv) {
var cube = []
var civ,i,v,c,d,dx,dy,ci,xnewc,ynewc
for (var civ = 0; civ < li*lv*lc ; civ++) {

	v = Math.floor(civ / (lc*li))
	ci = civ - v * lc * li
	i = Math.floor((ci) / lc)
	c = ci % lc; // x

	//xnewc = xc[c] * (1-boolcanmove[c]) + xmoved * boolcanmove[c]
	if (c==candidatetomove){
		xnewc = pixelsize * (i / liy) // rounding is actually done in the gpu.js code, so I don't actually need it here.  otherwise I would put a Math.round on this
		ynewc = pixelsize * (i % liy)
	} else {
		xnewc = xc[c]
		ynewc = yc[c]
	}
	dx = xv[v] - xnewc
	dy = yv[v] - ynewc
	d = Math.sqrt(dx*dx + dy*dy)

	cube.push(d)
}
return cube
}

if(runscript){

cubeC = cubeCandidate(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix)

left.innerHTML += "<br>"+"cubeC"
left.innerHTML += "<br>"+cubeC.slice(0,100).join("<br>")


}


const minCube = gpu.createKernel( function(d,f,lf) {
	var iv,civ,n,d1
	iv = this.thread.x
	
	n=1000
	for (var indf = 0; indf < lc; indf++) {
		if (indf >= lf) break
		civ = f[indf] + iv * lc
		// d1 = d[c][i][v] // d at x,y,z
		//(z * xMax * yMax) + (y * xMax) + x;
	
		d1 = d[civ]
		if (d1 < n) {
			n = d1 //min
		}
	}
	return n
}, {
	dimensions: [lv*li*lc], // y,x
	constants: {lv:lv,lc:lc,li:li}
})

if(runscript){

var min = minCube(cube,f,lf).slice(0,lv*li) // weird. we need to slice because there is something weird going on with the output dimensions
left.innerHTML += "<br>"+"min"
left.innerHTML += "<br>"+min.slice(0,100).join("<br>")
right.innerHTML += "<br>"+"min"
}
function minCubeJ(cube,f,lf,lc,li,lv) {
	var iv,civ,n,d1
var min=[]
for (var iv=0; iv<li*lv; iv++) {
	n=1000
	for (var indf = 0; indf < lf; indf++) {
		civ = f[indf] + iv * lc
		// d1 = d[c][i][v] // d at x,y,z
		//(z * xMax * yMax) + (y * xMax) + x;
	
		d1 = cube[civ]
		if (d1 < n) {
			n = d1 //min
		}
	}
	min.push(n)
	if(runscript) right.innerHTML += "<br>"+n
}
return min
}
if(runscript){

min = minCubeJ(cube,f,lf,lc,li,lv)
// oh, heres a problem... 
// gpu.js doesn't allow integers
// so I can't index by anything other than this.thread.x
}

const maxCube = gpu.createKernel( function(d,f,lf) {
	var iv,i,v,dx,dy,civ,n,m,d1
	iv = this.thread.x

	
	m=0
	for (var indf = 0; indf < lc; indf++) {
		if (indf >= lf) break
		civ = f[indf] + iv * lc
		// d1 = d[c][i][v] // d at x,y,z
		//(z * xMax * yMax) + (y * xMax) + x;
		d1 = d[civ]
		if (d1 > m) {
			m = d1 //max
		}
	}
	return m
}, {
	dimensions: [lv*li*lc], // y,x
	constants: {lv:lv,lc:lc,li:li}
})

if(runscript){

var max = maxCube(cube,f,lf).slice(0,lv*li)
left.innerHTML += "<br>"+"max"
left.innerHTML += "<br>"+max.slice(0,100).join("<br>")

right.innerHTML += "<br>"+"max"
}
function maxCubeJ(cube,f,lf,lc,li,lv){
	var iv,i,v,dx,dy,civ,n,m,d1
var max=[]
for (var iv=0; iv<li*lv; iv++) {
	m=-1
	for (var indf = 0; indf < lf; indf++) {
		civ = f[indf] + iv * lc
		// d1 = d[c][i][v] // d at x,y,z
		//(z * xMax * yMax) + (y * xMax) + x;
		// x + xMax * yz
	
		d1 = cube[civ]
		if (d1 > m) {
			m = d1 //min
		}
	}
	if(runscript) right.innerHTML += "<br>"+m
	max.push(m)
}
return max
}
if(runscript){

max = maxCubeJ(cube,f,lf,lc,li,lv)
}


const doFnorm = gpu.createKernel(function(n,m) {
	var iv = this.thread.x
	var fnorm
	//fnorm =  (m[iv]-n[iv])
	fnorm = 1/ (m[iv]-n[iv])
	return fnorm
}, {
	dimensions: [li*lv*lc],
})
if(runscript){

var fnormdone = doFnorm(min,max).slice(0,li*lv)


left.innerHTML += "<br>"+"fnorm"
left.innerHTML += "<br>"+fnormdone.slice(0,100).join("<br>")

right.innerHTML += "<br>"+"fnorm"
}
function doFnormJ(min,max,lc,li,lv) {
	var fnorm
var fnormdone=[]
for (var iv=0; iv<li*lv; iv++) {
	fnorm = 1/ (max[iv]-min[iv])
	if(runscript) right.innerHTML += "<br>"+fnorm
	fnormdone.push(fnorm)
}
return fnormdone
}
if(runscript){

fnorm = doFnormJ(min,max,lc,li,lv)
}

const doScores = gpu.createKernel(function(d,n,m,fnorm, minscore, maxscore) {
	var v,i,iv,civ,ci,normit,score
	civ = this.thread.x

	v = Math.floor(civ / (lc*li))
	ci = civ - v*lc*li
	i = Math.floor(ci / lc)
	iv = v * li + i

	//normit = (d[civ]-n[iv])*fnorm[iv] // indices must be wrong earlier
	normit = (d[civ]-n[iv]) / (m[iv]-n[iv])  
	score = Math.floor(.5+minscore+(maxscore-minscore)*(1-normit))
	if (score > maxscore) {
		score = maxscore
	} else if (score < minscore) {
		score = minscore
	}
	//return normit
	return score
}, {
	dimensions: [lc*li*lv],
	constants: {lv:lv,lc:lc,li:li}
})

if(runscript){

var scores = doScores(cube,min,max,fnormdone,0,5).slice(0,lc*li*lv)
left.innerHTML += "<br>"+"scores"
left.innerHTML += "<br>"+scores.slice(0,100).join("<br>")

right.innerHTML += "<br>"+"scores"
maxscore=5
minscore=0
}
function doScoresJ(cube,min,max,fnorm,minscore,maxscore,lc,li,lv) {
	var v,i,iv,civ,ci,normit,score
var scores=[]
for (var civ=0; civ<lc*li*lv; civ++) {
	v = Math.floor(civ / (lc*li))
	ci = civ - v*lc*li
	i = Math.floor(ci / lc)
	iv = v * li + i

	//normit = (d[civ]-n[iv])*fnorm[iv] // indices must be wrong earlier
	normit = (cube[civ]-min[iv]) / (max[iv]-min[iv])  
	score = Math.floor(.5+minscore+(maxscore-minscore)*(1-normit))
	if (score > maxscore) {
		score = maxscore
	} else if (score < minscore) {
		score = minscore
	}

	scores.push(score)
	if(runscript) right.innerHTML += "<br>"+score
}
return scores
}
if(runscript){

scores = doScoresJ(cube,min,max,fnorm,0,5,lc,li,lv)
}
const doTally = gpu.createKernel(function(scores) {
	var ci,sum
	ci = this.thread.x
	sum = 0
	for (var v = 0; v < lv; v++) {
		//var civ = ci + v *lc*li
		//civ = c + i *lc + v *lc*li
		//sum += scores[civ]
		sum += scores[ci + v *lc*li]
	}
	return sum
}, {
	dimensions: [li*lc*lv], // weird that we need this extra lv dimension, which we remove later
	constants: {lv:lv,lc:lc,li:li}
})
if(runscript){

var tally = doTally(scores).slice(0,li*lc)
left.innerHTML += "<br>"+"tally"
left.innerHTML += "<br>"+tally.slice(0,100).join("<br>")

right.innerHTML += "<br>"+"tally"
}
function doTallyJ(scores,lc,li,lv){
	var ci,sum
var tally = []
for (var ci = 0; ci< lc*li; ci++) {
	
	sum = 0
	for (var v = 0; v < lv; v++) {
		civ = ci + v *lc*li
		//civ = c + i *lc + v *lc*li
		sum += scores[civ]
	}
	tally.push(sum)
	if(runscript) right.innerHTML += "<br>"+sum
}
return tally
}
if(runscript){

tally = doTallyJ(scores,lc,li,lv)
}
const findWinner = gpu.createKernel(function(tally) {
	var i,ci,m,t1,mi
	i = this.thread.x
	m = -1
	mi = -1
	for (var c = 0; c < lc; c++) {
		ci = c + i * lc
		t1 = tally[ci]
		if(t1 >= m) {
			if (t1 == m) {
				mi = c + mi * lc // encode
			} else {
				m = t1
				mi = c
			}
		}
	}
	return mi
}, {
	dimensions: [li*lv*lc],
	constants: {lv:lv,lc:lc,li:li}
})
if(runscript){

var winner = findWinner(tally).slice(0,li)
left.innerHTML += "<br>"+"winner"
left.innerHTML += "<br>"+winner.join("<br>")

right.innerHTML += "<br>"+"winner"
}
function findWinnerJ(tally,lc,li,lv){
	var i,ci,m,t1,mi
var miset=[]
for (var i = 0; i < li; i++) {
	m = -1
	mi = -1
	for (var c = 0; c < lc; c++) {
		ci = c + i * lc
		t1 = tally[ci]
		if(t1 >= m) {
			if (t1 == m) {
				mi = c + mi * lc // encode
			} else {
				m = t1
				mi = c
			}
		}
	}
	if(runscript) right.innerHTML += "<br>"+mi
	miset.push(mi)
}
return miset
}
if(runscript){

miset = findWinnerJ(tally,lc,li,lv)
}
if (!onlylast) {
const superKernel = gpu.combineKernels(d,minCube,maxCube,doFnorm,doScores,doTally,findWinner, function(xv,yv,xf,yf,f,lf) {
		var cube,min,max,fnorm,scores,tally,winner
		cube = d(xv, yv, xf, yf)
		min = minCube(cube,f,lf)
		max = maxCube(cube,f,lf)
		fnorm = doFnorm(min,max)
		scores = doScores(cube,min,max,fnorm,0,5)
		
		tally = doTally(scores)
		winner = findWinner(tally)
		return winner
	})
	
if(runscript){

var winner = superKernel(xv,yv,xf,yf,f,lf).slice(0,li);
left.innerHTML += "<br>"+"megawinner"
left.innerHTML += "<br>"+winner.join("<br>")
right.innerHTML += "<br>"+"winner again"
right.innerHTML += "<br>"+miset.join("<br>")

// for ( var j=0;j<100;j++) {
// 	var winner = superKernel(xv,yv,xf,yf);
// 	left.innerHTML += "<br>"+winner[0])
// }

cube2 = d(xv, yv, xf, yf)
}

const superKernel2 = gpu.combineKernels(minCube,maxCube,doFnorm,doScores,doTally,findWinner, function(cube2,f,lf) {
		return findWinner(doTally(doScores(cube2,minCube(cube2,f,lf),maxCube(cube2,f,lf),doFnorm(maxCube(cube2,f,lf),minCube(cube2,f,lf)),0,5)))
	})

// const superKernel3 = gpu.combineKernels(d,superKernel2,function(xv,yv,xf,yf,f,lf){
// 	return superKernel2(d(xv,yv,xf,yf,f,lf))
// })
// can't do this kind of nesting
	
if(runscript){

var winner2 = superKernel2(cube2,f,lf).slice(0,li);
left.innerHTML += "<br>"+"megawinner2"
left.innerHTML += "<br>"+winner2.join("<br>")
right.innerHTML += "<br>"+"winner again"
right.innerHTML += "<br>"+miset.join("<br>")
}
}
// third try

function cubeToWinner(xv,yv,xf,yf,f,lf) {
cube3 = d(xv, yv, xf, yf)
min3 = minCube(cube3,f,lf)
max3 = maxCube(cube3,f,lf)
fnorm3 = doFnorm(min3,max3)
scores3 = doScores(cube3,min3,max3,fnorm3,0,5)

tally3 = doTally(scores3)
winner3 = findWinner(tally3).slice(0,li);
return winner3
}

if(runscript){

winner3 = cubeToWinner(xv,yv,xf,yf,f,lf)





left.innerHTML += "<br>"+"lessmegawinner3"
left.innerHTML += "<br>"+winner3.join("<br>")
right.innerHTML += "<br>"+"winner again"
right.innerHTML += "<br>"+miset.join("<br>")
}

function cubeToWinnerJ(xv,yv,xf,yf,f,lf,lc,li,lv) {
cube3 = dJ(xv, yv, xf, yf,lc,li,lv)
min3 = minCubeJ(cube3,f,lf,lc,li,lv)
max3 = maxCubeJ(cube3,f,lf,lc,li,lv)
fnorm3 = doFnormJ(min3,max3,lc,li,lv)
scores3 = doScoresJ(cube3,min3,max3,fnorm3,0,5,lc,li,lv)

tally3 = doTallyJ(scores3,lc,li,lv)
winner3 = findWinnerJ(tally3,lc,li,lv)
return winner3
}

function cubeCandidateToWinnerJ(xv,yv,xc,yc,f,candidatetomove,pixelsize,liy,lix,lf,lc,li,lv) {
cube3 = cubeCandidateJ(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix,lc,li,lv)
min3 = minCubeJ(cube3,f,lf,lc,li,lv)
max3 = maxCubeJ(cube3,f,lf,lc,li,lv)
fnorm3 = doFnormJ(min3,max3,lc,li,lv)
scores3 = doScoresJ(cube3,min3,max3,fnorm3,0,5,lc,li,lv)

tally3 = doTallyJ(scores3,lc,li,lv)
winner3 = findWinnerJ(tally3,lc,li,lv)
return winner3
}

function cubeVoterToWinnerJ(xv,yv,xc,yc,f,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix,lf,lc,li,lv) {
cube3 = cubeVoterJ(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix,lc,li,lv)
min3 = minCubeJ(cube3,f,lf,lc,li,lv)
max3 = maxCubeJ(cube3,f,lf,lc,li,lv)
fnorm3 = doFnormJ(min3,max3,lc,li,lv)
scores3 = doScoresJ(cube3,min3,max3,fnorm3,0,5,lc,li,lv)

tally3 = doTallyJ(scores3,lc,li,lv)
winner3 = findWinnerJ(tally3,lc,li,lv)
return winner3
}

if(runscript){

winner4 = cubeToWinnerJ(xv,yv,xf,yf,f,lf,lc,li,lv)

left.innerHTML += "<br>"+"lessmegawinner3 again"
left.innerHTML += "<br>"+winner3.join("<br>")
right.innerHTML += "<br>"+"winner megaJ"
right.innerHTML += "<br>"+winner4.join("<br>")



left.innerHTML += "<br>"+"done"
right.innerHTML += "<br>"+"done"
	
}

const superKernelCandidate = gpu.combineKernels(cubeCandidate,minCube,maxCube,doFnorm,doScores,doTally,findWinner, function(xv,yv,xc,yc,f,lf,candidatetomove,pixelsize,liy,lix) {
		// var cube,min,max,fnorm,scores,tally,winner
		cube = cubeCandidate(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix)
		min = minCube(cube,f,lf)
		max = maxCube(cube,f,lf)
		fnorm = doFnorm(min,max)
		scores = doScores(cube,min,max,fnorm,0,5)
		
		tally = doTally(scores)
		winner = findWinner(tally)
		return winner
	})

	
const superKernelVoter = gpu.combineKernels(cubeVoter,minCube,maxCube,doFnorm,doScores,doTally,findWinner, function(xv,yv,xc,yc,f,lf,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix) {
		//var cube,min,max,fnorm,scores,tally,winner
		cube = cubeVoter(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix)
		min = minCube(cube,f,lf)
		max = maxCube(cube,f,lf)
		fnorm = doFnorm(min,max)
		scores = doScores(cube,min,max,fnorm,0,5)
		
		tally = doTally(scores)
		winner = findWinner(tally)
		return winner
	})


cubeCandidateToWinner = function(xv,yv,xc,yc,f,lf,candidatetomove,pixelsize,liy,lix){
cube3 = cubeCandidate(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix)
min3 = minCube(cube3,f,lf)
max3 = maxCube(cube3,f,lf)
fnorm3 = doFnorm(min3,max3)
scores3 = doScores(cube3,min3,max3,fnorm3,0,5)

tally3 = doTally(scores3)
winner3 = findWinner(tally3)
return winner3
}


// these two are different because they use nesting instead of variables
// const superKernel3Candidate = gpu.combineKernels(cubeCandidate,superKernel2,function(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix){
// 	return superKernel2(cubeCandidate(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix))
// })
// const superKernel3Voter = gpu.combineKernels(cubeVoter,superKernel2,function(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix){
// 	return superKernel2(cubeVoter(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix))
// })
// can't do this kind of nesting

cubeVoterToWinner = function(xv,yv,xc,yc,f,lf,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix){
cubeV = cubeVoter(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix)
min3 = minCube(cube3,f,lf)
max3 = maxCube(cube3,f,lf)
fnorm3 = doFnorm(min3,max3)
scores3 = doScores(cube3,min3,max3,fnorm3,0,5)

tally3 = doTally(scores3)
winner3 = findWinner(tally3)
return winner3

} 





function fastyee(xc,yc,f,xv,yv,vg,xvcenter,yvcenter,movethisidx,whichtypetomove,method) {
	// have not implemented frontrunners yet
	lf = f.length
	if (whichtypetomove == "voter"){
		votergrouptomove = movethisidx
		
		if (method == "gpu") {
			// return cubeVoterToWinner(xv,yv,xc,yc,f,lf,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix).toArray(gpu).slice(0,li)
			return superKernelVoter(xv,yv,xc,yc,f,lf,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix).slice(0,li)
			// // return superKernel3Voter(xv,yv,xc,yc,candidatetomove,pixelsize,liy,lix).toArray(gpu).slice(0,li)
		} else if (method == "js") {
			return cubeVoterToWinnerJ(xv,yv,xc,yc,f,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix,lf,lc,li,lv)
		}
	} else if (whichtypetomove == "candidate"){
		candidatetomove = movethisidx
		if (method == "gpu") {
			// return cubeCandidateToWinner(xv,yv,xc,yc,f,lf,candidatetomove,pixelsize,liy,lix).toArray(gpu).slice(0,li)
			return superKernelCandidate(xv,yv,xc,yc,f,lf,candidatetomove,pixelsize,liy,lix).slice(0,li)
			// // return superKernel3Candidate(xv,yv,xc,yc,xvcenter,yvcenter,vg,votergrouptomove,pixelsize,liy,lix).toArray(gpu).slice(0,li)
		} else if (method == "js") {
			return cubeCandidateToWinnerJ(xv,yv,xc,yc,f,candidatetomove,pixelsize,liy,lix,lf,lc,li,lv)
		}
	}
}

return fastyee
} // end of createKernelYee
