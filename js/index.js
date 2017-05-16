var form = $('.form');
var btn = $('#submit');
var logout = $('#logout');
var topbar = $('.topbar');
var input = $('#password');
var authInput = $('#auth');
var article =$('.article');
var tries = 0;
var h = input.height();
var lockout = 0;
var wasLocked = false;
var loggedIn = 0;
var getLockout = function(){
  var now = new Date();
  if(lockout){
    if(now.getTime()-lockout<60000){
      return true;
    }
  }
};
var getLoggedIn = function(){
  var now = new Date();
  if(loggedIn){
    if(now.getTime()-loggedIn<3600000){
      return true;
    }
  }
};

var getLockoutTime = function(){
  var now = new Date();
  if(lockout){
    return String(Math.ceil(60 - (now.getTime()-lockout)/1000)) + 's';
  }
}
if (typeof(Storage) !== "undefined") {
  lockout = localStorage.getItem("lockout");
  loggedIn = localStorage.getItem("loggedIn");
  if(getLoggedIn()){
    topbar.addClass('success');
    form.addClass('goAway');
    article.addClass('active');
    tries=0;
  }
  if(getLockout()){
    btn.text('Locked for ' + getLockoutTime());
    btn.text('Login');
    wasLocked = true;
  }

}

$('.spanColor').height(h+23);
input.on('focus',function(){
  topbar.removeClass('error success');
  input.text('');
});
logout.on('click', function(){
  localStorage.setItem('loggedIn',0);
  topbar.removeClass('success');
  form.removeClass('goAway');
  article.removeClass('active');
  location.reload();
})
btn.on('click',function(){
  if(tries<=2){
    var pass = $('#password').val();
    var user = $('#username').val();
    var auth = $('#auth').val();
    if(user === 'arduino' && pass==='password' && authenticate(auth) ){
    //if(true){
    setTimeout(function(){
      btn.text('Success!');
      var now = new Date();
      localStorage.setItem('loggedIn',now.getTime());
      loggedIn = localStorage.getItem('loggedIn');
    },250);
    topbar.addClass('success');
    form.addClass('goAway');
    article.addClass('active');
    tries=0;
  }
    else{
      topbar.addClass('error');
      tries++;
      if(getLockout()){
        tries = 4;
      }
      switch(tries){
        case 0:
          btn.text('Login');
          break;
        case 1:
          setTimeout(function(){
          btn.text('You have 2 tries left');
          },300);
          break;
        case 2:
          setTimeout(function(){
          btn.text('Only 1 more');
          },300);
          break;
        case 3:
          wasLocked = true;
          setTimeout(function(){
          var now = new Date();
          localStorage.setItem('lockout',now.getTime());
          lockout = localStorage.getItem('lockout');
          btn.text('Locked for ' + getLockoutTime());
          },300);
          btn.text('Login');
          break;
        case 4:
          setTimeout(function(){
          btn.text('Locked for ' + getLockoutTime());
          },300);
          lockFront();
          break;
         default:
          btn.text('Login');
          break;
      }
    }
  }
  else{
    topbar.addClass('disabled');
  }

});
var lockFront = function(){
  input.prop('disabled',true);
  authInput.prop('disabled',true);
  topbar.removeClass('error');
  input.addClass('disabled');
  authInput.addClass('disabled');
  btn.addClass('recover');
}

$('.form').keypress(function(e){
   if(e.keyCode==13)
   submit.click();
});
input.keypress(function(){
  topbar.removeClass('success error');
});



/////// AUTHENTICATOR ///////

var sumOfDigits = function(num){
 var sum = 0;
 var str=num.toString();
 for(i=0;i<str.length;i++){
   sum+=Number(str.charAt(i));
 }
 return sum;
};

var product = function(num){
 while(num.toString().length<8){
   num*=31;
 }
 num=trimLong(num);
 if(num%2==0){
   return hash(num+31);
 } else {
   return num;
 }
}
var hash = function(num){
 var sum = sumOfDigits(num)+sumOfDigits(SECRET);
 var code = product(sum);
 return code;
}

var trimLong = function(num){
 while(num.toString().length>8){
   num/=10;
   n=Math.floor(num);
 }
 return num;
}

var authenticate = function(input){
 var d = new Date();
 var n = d.getTime();
 var seed = 60 + Math.floor(Math.floor(n/1000)/60);
 var code = hash(seed);
 var input = Number(input);
 if(input==code){
   return true;
 } else {
   return false;
 }
}

//////// INTERVAL /////
window.setInterval(function(){
  if(getLockout()){
    btn.text('Locked for ' + getLockoutTime());
  } else if(wasLocked){
    wasLocked = false;
    btn.removeClass('recover');
    input.removeClass('disabled');
    authInput.removeClass('disabled');
    input.prop('disabled',false);
    authInput.prop('disabled',false);
    btn.text('Login');
  }
},1000);
