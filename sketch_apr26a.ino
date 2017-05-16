#include <LiquidCrystal595.h>    // include the library
#include <Keypad.h>
#include <Wire.h>
#include "RTClib.h"
RTC_DS3231 rtc;
long secret = 11235813;
const byte rows= 4;     // Number of rows on the keypad
const byte columns= 3;  // Number of columns on the keypad
char* pass = "1234";
char* tryPass = "0000";
int track = 0;
int changePin = 0; // 0 = Default Setting, 1 = Want to change PIN. Authenticate, 2 = PIN Authenticated. Changing PIN.
char keymap[rows][columns]= 
  {
    {'1', '2', '3'}, 
    {'4', '5', '6'}, 
    {'7', '8', '9'},
    {'*', '0', '#'}
  };
 
// These arrays map rows and columns to the Arduino pins
byte rowPins[rows]       = {8,7,6,5}; //Rows 0 to 3
byte columnPins[columns] = {4,3,2}; //Columns 0 to 3
 
Keypad keypad = Keypad(makeKeymap(keymap), rowPins, columnPins, rows, columns);
LiquidCrystal595 lcd(9,10,11);     // datapin, latchpin, clockpin

void setup() {
  #ifndef ESP8266
    while (!Serial); // for Leonardo/Micro/Zero
  #endif

  Serial.begin(9600);

  delay(3000); // wait for console opening

  if (! rtc.begin()) {
    Serial.println("Couldn't find RTC");
    while (1);
  }

  if (rtc.lostPower()) {
    Serial.println("RTC lost power, lets set the time!");
    // following line sets the RTC to the date & time this sketch was compiled
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // This line sets the RTC with an explicit date & time, for example to set
    // January 21, 2014 at 3am you would call:
    // rtc.adjust(DateTime(2014, 1, 21, 3, 0, 0));
   }
   lcd.begin(16,2);             // 16 characters, 2 rows
   resetLcd("Enter Pin");
}

void loop() {
  char key = keypad.getKey();
  if (key != NO_KEY)
  {
    if (key == '*'){
      resetLcd("Enter PIN");
    } else if (key == '#'){
      changePin = 1;
      resetLcd("PIN Change");
      delay(1500);
      resetLcd("Current PIN");
    } else {
      lcd.print('*');
      delay(150);
      keyPass(key);
    }
  }
}
void keyPass(char key){
  tryPass[track] = key;
  track++;
  if(track==4){
    if(changePin == 2){
      pinChange();
    } else if(strcmp(pass,tryPass)==0){
      resetLcd("Success");
      delay(1000);
      if(changePin == 1){
        newPin();
      } else {
        displayCode();
      }    
    } else {
      resetLcd("Incorrect");
      changePin = 0;
      delay(1500);
      resetLcd("Enter PIN");
    }
    track = 0;
  }
}

void newPin(){
  resetLcd("Enter New PIN");
  changePin = 2;
}

void pinChange(){
  resetLcd("PIN Changed");
  for(int i=0;i<4;i++){
    pass[i]=tryPass[i];
  };
  tryPass = "0000";
  delay(1500);
  changePin = 0;
  resetLcd("Enter PIN");
}

void resetLcd(char* message){
  track=0;
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print(message);
  lcd.setCursor(0,1);
}

int sumOfDigits(long number){
  int count = 0;
  long n = number;

  /* extract each digit */
  while (n != 0){
    count += n % 10;
    n /= 10;
  }
  return count;
}

long product(int number){
  long big = (long)number;
  while(checkSize(big)<8){
    big *=31L;
  }
  big = trimLong(big);
  if(big%2==0){
    return hash(big+31L);
  } else {
    return big;
  }
};

int checkSize(long num){
  long n = num;
  int c=0;
  while(n!=0){
    n/=10;
    c++;
  }
  return c;
};

long hash(long stamp){
  int sum = sumOfDigits(stamp) + sumOfDigits(secret);
  long code = product(sum);
  return code;
}

long trimLong(long num){
  long n = num;
  while(checkSize(n)>8){
    n/=10;
  }
  return n;
}

void displayCode(){
  DateTime now = rtc.now();
  long code = hash(now.unixtime()/60L);
  lcd.clear();
  while(now.second()>1){
    
    lcd.setCursor(0,0);
    lcd.print("Display for: ");
    lcd.print(60-now.second());
    lcd.print("s");
    lcd.setCursor(0,1);
    lcd.print(code);
    delay(1000);
    resetLcd("Enter PIN");
    now=rtc.now();
  }
}

