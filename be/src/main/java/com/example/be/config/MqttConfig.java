package com.example.be.config;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

@Configuration
public class MqttConfig {

//    private final String MQTT_BROKER = "tcp://192.168.137.1:1883";
//    private final String MQTT_CLIENT_ID = "SpringBootServer";
//
//    @Bean
//    public DefaultMqttPahoClientFactory mqttClientFactory() {
//        MqttConnectOptions options = new MqttConnectOptions();
//        options.setServerURIs(new String[]{MQTT_BROKER});
//        return new DefaultMqttPahoClientFactory() {{
//            setConnectionOptions(options);
//        }};
//    }
//
//    // Channel nhận message
//    @Bean
//    public MessageChannel mqttInputChannel() {
//        return new DirectChannel();
//    }
//
//    // Adapter lắng nghe topic
//    @Bean
//    public MessageProducer inbound() {
//        MqttPahoMessageDrivenChannelAdapter adapter =
//                new MqttPahoMessageDrivenChannelAdapter(MQTT_CLIENT_ID + "_in", mqttClientFactory(),
//                        "iot/sensor/data");
//        adapter.setCompletionTimeout(5000);
//        adapter.setConverter(new DefaultPahoMessageConverter());
//        adapter.setQos(1);
//        adapter.setOutputChannel(mqttInputChannel());
//        return adapter;
//    }
//
//    // Handler xử lý dữ liệu khi nhận được
//    @Bean
//    @ServiceActivator(inputChannel = "mqttInputChannel")
//    public MessageHandler handler() {
//        return message -> {
//            String payload = message.getPayload().toString();
//            System.out.println("📥 Received from MQTT: " + payload);
//        };
//    }
//
//    // Channel publish dữ liệu (gửi lệnh điều khiển)
//    @Bean
//    public MessageChannel mqttOutboundChannel() {
//        return new DirectChannel();
//    }
//
//    // Handler publish
//    @Bean
//    @ServiceActivator(inputChannel = "mqttOutboundChannel")
//    public MessageHandler mqttOutbound() {
//        MqttPahoMessageHandler handler =
//                new MqttPahoMessageHandler(MQTT_CLIENT_ID + "_out", mqttClientFactory());
//        handler.setAsync(true);
//        handler.setDefaultTopic("iot/control");
//        return handler;
//    }
}

