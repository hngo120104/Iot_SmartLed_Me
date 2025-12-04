#define LED_PIN 13
#define LED_TYPE WS2812B
#define NUM_LEDS 12

#define LDR_DO_PIN 33
#define LDR_AO_PIN 32
#define DHT_PIN 14
#define SOUND_PIN 25

#include <WiFiClientSecure.h>
#include <WiFi.h>
#include <FastLED.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000); 


const char* ssid = "astrios04";
const char* password = "hoang12124";
const char* mqttServer = "ddfcdef7ae004b43a84d4f38a2709f6c.s1.eu.hivemq.cloud";
const int mqttPort = 8883;
const char* mqtt_user = "astrios04";
const char* mqtt_password = "Hoang12124@";

#define TOPIC_LED_STATE "led/state/led"
#define TOPIC_ENV "led/state/env"
#define TOPIC_LED_SET "led/cmd/set"
#define TOPIC_ENV_HIS "led/state/env/history"

WiFiClientSecure espClient;
PubSubClient client(espClient);


#define SAMPLE 50
#define NOISE 200
#define COLOR_ORDER GRB
bool ledUpdate = false;

CRGB leds[NUM_LEDS];

#include <DHT.h>
DHT dht(DHT_PIN, DHT11);

enum Mode {
  MODE_MANUAL, // control via web UI
  MODE_TEMP, // display leds on temperature
  MODE_HUMID, // display leds on humidity
  MODE_LIGHT, // display leds on env light level
  MODE_RAINBOW // rainbow leds
};

Mode currentMode = MODE_MANUAL;
int globalBrightness = 50;
float h, t;
int lux;

void setup_Wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
};

void callback(char* topic, byte* payload, unsigned int length);

void setup_Mqtt() {
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  while (!client.connected()) {
    String cid = "ESP32-" + String(random(0xffff), HEX);
    if (client.connect(cid.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("HiveMQ connected");
      Serial.println("client id: "); Serial.println(cid);
      client.subscribe(TOPIC_LED_SET);
    } else {
      delay(2000);
    }
  }
};

void setup() {
  Serial.begin(9600);
  delay(500);
  setup_Wifi();
  timeClient.begin();
  espClient.setInsecure();
  setup_Mqtt();

  pinMode(LDR_AO_PIN, INPUT);
  analogSetAttenuation(ADC_11db);

  dht.begin();

  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(50);
};

unsigned long lastRainbow = 0;
unsigned long lastUpdate = 0;
unsigned long lastLedPub = 0;
unsigned long lastLightUpdate = 0;
unsigned int hue = 0;
unsigned long lastEnvPub = 0;
#define LED_PUB_INTERVAL 1000
#define ENV_PUB_INTERVAL 1000


void loop() {
  if (!client.connected()) setup_Mqtt();
  client.loop();
  timeClient.update();
  unsigned long now = millis();

  // Rainbow update
  if (currentMode == MODE_RAINBOW && now - lastRainbow > 20) {
    lastRainbow = now;
    for (int i = 0; i < NUM_LEDS; i++) {
      leds[i] = CHSV(hue + (i * 255 / NUM_LEDS), 255, 255);
    }
    FastLED.show();
    ledUpdate = true;
    hue++;
  }

  if (ledUpdate && now - lastLedPub > LED_PUB_INTERVAL) {
    publishLedState();
    lastLedPub = millis();
    ledUpdate = false;
  }


  if (now - lastEnvPub > ENV_PUB_INTERVAL) {
    publishEnvHistory();
    lastEnvPub = now;
  }
  // Temperature / Humidity / Light update (2s)
  if (currentMode == MODE_TEMP) handleTemperature();
  if (currentMode == MODE_HUMID) handleHumidity();

  if (currentMode == MODE_LIGHT && now - lastLightUpdate > 40) {
    handleLight();
    lastLightUpdate = millis();  
  }
}


void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<512> doc;
  Serial.println("Receive from topic: ");
  Serial.println(topic);
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) return;

  // ===== MODE =====
  if (strcmp(topic, TOPIC_LED_SET) == 0) {
    if (doc.containsKey("mode")) {
      const char* mode = doc["mode"];
      Serial.println(mode);
      if (strcmp(mode, "manual") == 0) currentMode = MODE_MANUAL;
      else if (strcmp(mode, "temperature") == 0) currentMode = MODE_TEMP;
      else if (strcmp(mode, "humidity") == 0) currentMode = MODE_HUMID;
      else if (strcmp(mode, "light") == 0) {currentMode = MODE_LIGHT; return;}
      else if (strcmp(mode, "rainbow") == 0) currentMode = MODE_RAINBOW;
    }
  }
  if (doc.containsKey("brightness")) {
      globalBrightness = doc["brightness"];
      Serial.println(globalBrightness);
      FastLED.setBrightness(globalBrightness);
      FastLED.show();
    }

  // ===== MANUAL SET =====
  if (currentMode == MODE_MANUAL) {

    const char* target = doc["target"];
    int r = doc["color"][0];
    int g = doc["color"][1];
    int b = doc["color"][2];

    if (strcmp(target, "all") == 0) {
      fill_solid(leds, NUM_LEDS, CRGB(r, g, b));
    }
    else if (strcmp(target, "single") == 0) {
      int id = doc["id"];
      if (id >= 0 && id < NUM_LEDS)
        leds[id] = CRGB(r, g, b);
    }
    else if (strcmp(target, "group") == 0) {
      for (int id : doc["ids"].as<JsonArray>()) {
        if (id >= 0 && id < NUM_LEDS)
          leds[id] = CRGB(r, g, b);
      }
    }
    FastLED.show();
    ledUpdate = true;
    publishLedState();
  }
}

void publishEnvHistory() {
  h = dht.readHumidity();
  t = dht.readTemperature();
  lux = readLuxSmooth();

  StaticJsonDocument<128> doc;
  doc["ts"] = timeClient.getEpochTime();
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["lux"] = lux;

  char buf[128];
  serializeJson(doc, buf);
  client.publish("led/state/env/history", buf);
}



void publishLedState() {
  StaticJsonDocument<512> doc;
  doc["mode"] = currentMode;
  doc["brightness"] = globalBrightness;

  JsonArray arr = doc.createNestedArray("leds");
  for (int i = 0; i < NUM_LEDS; i++) {
    JsonObject o = arr.createNestedObject();
    o["id"] = i;
    JsonArray c = o.createNestedArray("color");
    c.add(leds[i].r);
    c.add(leds[i].g);
    c.add(leds[i].b);
  }

  char buf[512];
  serializeJson(doc, buf);
  client.publish(TOPIC_LED_STATE, buf);
}

void handleHumidity() {
  CRGB c;
  if (h < 30) c = CRGB(241, 142, 161);
  else if (h < 60) c = CRGB(142, 223, 241);
  else c = CRGB(142, 170, 241);
  fill_solid(leds, NUM_LEDS, c);
  FastLED.show();
  ledUpdate = true;
}

void handleTemperature() {
  CRGB c;
  if (t < 25) c = CRGB::Blue;
  else if (t <= 30) c = CRGB::Green;
  else c = CRGB::Red;

  fill_solid(leds, NUM_LEDS, c);
  FastLED.show();
  ledUpdate = true;
}

#define LDR_SAMPLES 20

int readLuxFiltered() {
  long sum = 0;
  for (int i = 0; i < LDR_SAMPLES; i++) {
    sum += analogRead(LDR_AO_PIN);
    delayMicroseconds(200);
  }
  int adc = sum / LDR_SAMPLES;

  // Chống tràn / cực trị
  adc = constrain(adc, 50, 4000);

  return adc;
}

float luxEMA = 0;
const float LUX_ALPHA = 0.1; // càng nhỏ càng mượt (0.05–0.15)

int readLuxSmooth() {
  int raw = readLuxFiltered();
  luxEMA = luxEMA * (1 - LUX_ALPHA) + raw * LUX_ALPHA;
  return (int)luxEMA;
}

int smoothStep(int current, int target, int maxStep) {
  if (abs(target - current) <= maxStep) return target;
  return current + (target > current ? maxStep : -maxStep);
}


float smoothBrightness = 50; // global

int currentBrightness = 50;

void handleLight() {
  int luxRaw = readLuxSmooth();

  // Map lux -> brightness
  int targetBrightness = map(luxRaw, 0, 4095, 15, 200);
  targetBrightness = constrain(targetBrightness, 15, 200);

  // Chống nhảy gắt
  currentBrightness = smoothStep(currentBrightness, targetBrightness, 2);

  // Nếu LED đang tắt thì bật màu mặc định
  bool allOff = true;
  for (int i = 0; i < NUM_LEDS; i++) {
    if (leds[i]) { allOff = false; break; }
  }
  if (allOff) fill_solid(leds, NUM_LEDS, CRGB::White);

  FastLED.setBrightness(currentBrightness);
  FastLED.show();
}




