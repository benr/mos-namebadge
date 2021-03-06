load('api_config.js');
load('api_timer.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_http.js');
load("api_adc.js");
load("api_sys.js");
load('api_arduino_ssd1306.js');


let oled_addr = Cfg.get('featherwing.oled_addr');
let button_a  = Cfg.get('featherwing.buttons.a');
let button_b  = Cfg.get('featherwing.buttons.b');
let button_c  = Cfg.get('featherwing.buttons.c');

print(" -------------------------------------------------");
print(" ------------ Starting NAME BADGE ----------------");
print(" -------------------------------------------------");

print("Pin Configuration: A=", button_a, 
      " B=", button_b, " C=", button_c);

/* *********************************************************** 
 *          Adafruit FeatherWing OLED                        *
 * ********************************************************* */
let oled = Adafruit_SSD1306.create_i2c(4, Adafruit_SSD1306.RES_128_32);

oled.begin(Adafruit_SSD1306.SWITCHCAPVCC, 0x3C, true);
oled.clearDisplay();

let showStr = function(d, str) {
  d.clearDisplay();
  d.setTextSize(2);
  d.setTextColor(Adafruit_SSD1306.WHITE);
  d.setCursor(0,0);
  d.write(str);
  d.display();
};

/* *********************************************************** 
 *          Adafruit FeatherWing Button Setup                *
 * ********************************************************* */
GPIO.set_mode(button_a, GPIO.MODE_INPUT);
GPIO.set_pull(button_a, GPIO.PULL_UP);

GPIO.set_mode(button_b, GPIO.MODE_INPUT);  
GPIO.set_pull(button_b, GPIO.PULL_UP);

GPIO.set_mode(button_c, GPIO.MODE_INPUT);
GPIO.set_pull(button_c, GPIO.PULL_UP);


/* ***********************************************************
 *          Adafruit FeatherWing Button Functions            *
 * ********************************************************* */

let showName = function(pin) {
  print('Pin', pin, 'got interrupt');
  //showStr(oled, "A Pushed");
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setTextColor(Adafruit_SSD1306.WHITE);
  oled.setCursor(90,0);
  oled.write("Ben"); 
  oled.setCursor(30,16);
  oled.write("Rockwood");
  oled.display();
  
  Timer.set(10000, 0 , showTitle, null);
};

let showTitle = function(pin) {
  print('Pin', pin, 'got interrupt');
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setTextColor(Adafruit_SSD1306.WHITE);
  oled.setCursor(0,0);
  oled.write("Director");
  oled.setCursor(0,16);
  oled.write("IT & Ops");
  oled.display();
  Timer.set(5000, 0 , showWeather, null);
};

let showWeather = function(pin){
  print('Pin', pin, 'got interrupt');

  HTTP.query({
    url: 'http://api.wunderground.com/api/35f3f2434aa4ec38/conditions/q/WA/Seattle.json',
    success: function(body, full_http_msg){
        let weather = JSON.parse(body);
	/* 
        print("City is" + JSON.stringify(weather.current_observation.display_location.city));
        print(JSON.stringify(weather.current_observation.temp_f));
        print(JSON.stringify(weather.current_observation.weather));

        let output =  weather.current_observation.display_location.city + " " +
                        JSON.stringify(Math.round(weather.current_observation.temp_f)) +
                        "F " +
                        weather.current_observation.weather;
        print("OUTPUT IS:", output);
        //showStr(oled, output);
	*/
  	oled.clearDisplay();
  	oled.setTextColor(Adafruit_SSD1306.WHITE);

  	oled.setCursor(0,0); oled.setTextSize(4); oled.write(JSON.stringify(Math.round(weather.current_observation.temp_f))); 
  	oled.setCursor(50,0); oled.setTextSize(1); oled.write(weather.current_observation.display_location.city);
  	oled.setCursor(50,16); oled.setTextSize(1); oled.write(weather.current_observation.weather);
  	oled.display();

    },
    error: function(err) { print(err); showStr('Error :('); }
    });
  Timer.set(5000, 0 , showName, null);
};

let showBattery = function(pin){
  print('Pin', pin, 'got interrupt');
  ADC.enable(35);  
  let battery_voltage = (ADC.read(35)/4095)*2*3.3*1.1;
  //showStr(oled, JSON.stringify(battery_voltage) + "V");

  oled.clearDisplay();
  oled.setTextColor(Adafruit_SSD1306.WHITE);

  oled.setCursor(0,0); oled.setTextSize(1); oled.write(JSON.stringify(battery_voltage) + "V");
  oled.setCursor(24,16); oled.setTextSize(4); 
  if (battery_voltage > 4.1) {           oled.write("----");
    } else if ( battery_voltage > 3.4) { oled.write(" ---");
    } else if ( battery_voltage > 3.3) { oled.write("  --");
    } else if ( battery_voltage > 3.0) { oled.write("   -");
    } else {                             oled.write("?"); 
  }
  oled.display();
};

let showTime = function(pin){
  let now = Timer.now();
  let t = Timer.fmt("%I:%M%p", now);
  oled.clearDisplay();
  oled.setTextColor(Adafruit_SSD1306.WHITE);
  oled.setCursor(0,0); oled.setTextSize(4); oled.write(t);
  oled.display();

};


/* ***********************************************************
 *          Adafruit FeatherWing Interrupt Handlers          *
 * ********************************************************* */

GPIO.set_int_handler(button_a, GPIO.INT_EDGE_NEG, showName, null);
GPIO.enable_int(button_a);


GPIO.set_int_handler(button_b, GPIO.INT_EDGE_NEG, showWeather, null);
GPIO.enable_int(button_b);


GPIO.set_int_handler(button_c, GPIO.INT_EDGE_NEG, showBattery, null);
GPIO.enable_int(button_c);


/* ***********************************************************
 *           Main                                            *
 * ********************************************************* */
showName();    
