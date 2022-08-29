module.exports.generatePassword =()=>{
    var len = 8;
    var arr = process.env.GENRATE_PASSWORD;
    var ans = "";
    for (var i = len; i > 0; i--) {
      ans += arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}