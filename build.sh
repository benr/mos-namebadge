#!/bin/bash

echo "----------------------------------------------------------------"
echo "Building:"
#mos build --platform esp32 
mos build --platform esp8266

echo "----------------------------------------------------------------"
echo "Flashing:"
mos flash 

echo "----------------------------------------------------------------"
echo "Setting I2C Pins:"
sleep 10 
#mos config-set i2c.scl_gpio=22 i2c.sda_gpio=23 		## ESP32 Feather Huzzah32
mos config-set i2c.scl_gpio=5 i2c.sda_gpio=4 			## ESP8266 Feather Huzzah

echo "----------------------------------------------------------------"
echo "Configuring WIFI:"
mos wifi HOME-701D-2.4 7737A4C7CNTW9H4F

echo "----------------------------------------------------------------"
echo "Starting Console:"
mos console

