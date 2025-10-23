package com.example.be.controller;

import com.example.be.dto.DataSentReceived;
import com.example.be.model.TurnOnLED;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.recognizers.text.ModelResult;
import com.microsoft.recognizers.text.datetime.DateTimeRecognizer;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
public class GGController {
    private DataSentReceived data;
    //các câu lệnh thường xuyên để đổi màu
    private ArrayList<String> listChangeColor;
    //các màu
    private HashMap<String, String> colors;
    //Khởi tạo đèn
    private TurnOnLED turnLED;
    //khởi tạo mảng lưu ca thoiwf gian báo thức
    private TreeSet<Long> arrTime;
    //hàm khởi tạo
    @PostConstruct
    public void init() {
        arrTime = new TreeSet<>();
        data = new DataSentReceived();
        turnLED=new TurnOnLED();
        data.setObj(turnLED);
        listChangeColor = new ArrayList<>();
        colors = new HashMap<>();
        listChangeColor.add("chuyển");
        listChangeColor.add("chỉnh");
        listChangeColor.add("thay đổi");
        colors.put("đen", "0,0,0");
        colors.put("trắng", "255,255,255");
        colors.put("đỏ", "255,0,0");
        colors.put("xanh lá", "0,255,0");
        colors.put("xanh dương", "0,0,255");
        colors.put("vàng", "255,255,0");
        colors.put("ngọc lam", "0,255,255");          // Cyan
        colors.put("hồng cánh sen", "255,0,255");     // Magenta
        colors.put("xám", "128,128,128");
        colors.put("xám đậm", "64,64,64");
        colors.put("xám nhạt", "192,192,192");
        colors.put("xam", "255,165,0");
        colors.put("nâu", "165,42,42");
        colors.put("hồng", "255,192,203");
        colors.put("tím", "128,0,128");
        colors.put("chàm", "75,0,130");              // Indigo
        colors.put("tím nhạt", "238,130,238");       // Violet
        colors.put("vàng kim", "255,215,0");
        colors.put("bạc", "192,192,192");
        colors.put("lục nhạt", "144,238,144");
        colors.put("xanh trời", "135,206,235");       // Sky Blue
        colors.put("cam san hô", "255,127,80");      // Coral
        colors.put("hồng đào", "255,218,185");       // Peach
        colors.put("sô-cô-la", "210,105,30");        // Chocolate
        colors.put("đỏ tươi", "220,20,60");          // Crimson
        colors.put("cà chua", "255,99,71");          // Tomato
        colors.put("hồng đậm", "255,20,147");        // Deep Pink
        colors.put("cam đậm", "255,140,0");          // Dark Orange
        colors.put("vàng nhạt", "255,255,224");      // Light Yellow
        colors.put("be", "245,245,220");
        colors.put("xanh bạc hà", "189,252,201");    // Mint
        colors.put("ngọc", "64,224,208");            // Turquoise
        colors.put("xanh nhạt", "173,216,230");      // Light Blue
        colors.put("xanh đậm", "0,0,139");           // Dark Blue
        colors.put("xanh lá đậm", "0,100,0");        // Dark Green
        colors.put("cam đào", "255,218,185");        // Peach
        colors.put("hồng cam", "255,127,80");        // Coral
        colors.put("oliu", "128,128,0");
        colors.put("navy", "0,0,128");
        colors.put("teal", "0,128,128");
        colors.put("xanh lá mạ", "0,255,127");       // Spring Green
        colors.put("xanh biển", "0,191,255");        // Deep Sky Blue
        colors.put("xanh lục biển", "32,178,170");   // Light Sea Green
        colors.put("tím than", "72,61,139");        // Dark Slate Blue
        colors.put("hồng nhạt", "255,182,193");      // Light Pink
        colors.put("vàng cam", "255,165,0");         // Orange
        colors.put("nâu vàng", "210,180,140");       // Tan
        colors.put("xanh lục nhạt", "152,251,152");  // Pale Green
        colors.put("xanh lơ nhạt", "176,224,230");
        //Khởi tạo luồng để báo thức
        new Thread(()->setAlarm()).start();
    }
    @PostMapping("/received")
    public ResponseEntity<String> receive(@RequestParam("file") String message) {
        System.out.println(message);
        return ResponseEntity.ok("received");
    }
    @PostMapping("/received/text")
    public ResponseEntity<?> receiveText(@RequestBody Map<String, String> body){
        String text = body.get("text").toLowerCase();
        if(text.contains("bật đèn")){

            // Regex lấy số sau "mức sáng"
            Pattern pLevel = Pattern.compile("độ sáng\\s+(\\d+)");
            Matcher mLevel = pLevel.matcher(text);
            String level = mLevel.find() ? mLevel.group(1) : null;
            if(level != null){
                turnLED.setLevel(Integer.parseInt(level));
            }
            for(String color : colors.keySet()){
                if(text.contains(color)){
                    //lấy bảng màu rgb tương ứng
                    String c=colors.get(color);
                    if(c != null){
                        //tách thành các giá trị rgb
                        String tmp[]=c.split(",");
                        turnLED.setR(Integer.parseInt(tmp[0]));
                        turnLED.setG(Integer.parseInt(tmp[1]));
                        turnLED.setB(Integer.parseInt(tmp[2]));
                    }
                    break;
                }
            }
            data.setType("bật đèn");
        }
        if(text.contains("báo thức")){
            String en=translateViToEn(text);
            System.out.println(en);
            LocalDateTime time=getTime(en);
            System.out.println(time);
            if(time!=null&&time.isAfter(LocalDateTime.now())){
                long millis = time.toInstant(ZoneOffset.UTC).toEpochMilli();
                arrTime.add(Math.round((double)millis/1000));
            }
        }
        if(text.equals("bật chế độ tự động")){
            data.setType("tự động");
        }
        if(text.equals("tắt chế độ tự động")){
            data.setType("tắt đèn");
        }
        if(text.contains("tắt đèn")){
            data.setType("tắt đèn");
        }
        if(text.contains("giảm độ sáng")){
            if(turnLED.getLevel()>1) {
                turnLED.setLevel(turnLED.getLevel() - 1);
            }
        }
        if(text.contains("tăng độ sáng")){
            if(turnLED.getLevel()<4) {
                turnLED.setLevel(turnLED.getLevel() + 1);
            }
        }
        for(int i=0;i<listChangeColor.size();i++){
            String type=listChangeColor.get(i)+" sang màu";
            if(text.contains(type)){
                for(String color : colors.keySet()){
                    if(text.contains(color)){
                        //lấy bảng màu rgb tương ứng
                        String c=colors.get(color);
                        System.out.println(color);
                        if(c != null){
                            //tách thành các giá trị rgb
                            String tmp[]=c.split(",");
                            turnLED.setR(Integer.parseInt(tmp[0]));
                            turnLED.setG(Integer.parseInt(tmp[1]));
                            turnLED.setB(Integer.parseInt(tmp[2]));
                        }
                        break;
                    }
                }
            }
        }
        return ResponseEntity.ok(data);
    }
    @PostMapping("/data")
    public ResponseEntity<?> sentData() {
        return ResponseEntity.ok(data);
    }
    public String translateViToEn(String vietnameseText) {
        try {
            // 1. Encode input để đưa vào URL
            String encodedText = vietnameseText.replaceAll(" ","+");
            String url = String.format("https://api.mymemory.translated.net/get?q=%s&langpair=vi|en", encodedText);

            // 2. Gọi API
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            // 3. Parse JSON trả về
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            String encodedTranslated = root.path("responseData").path("translatedText").asText();
            String translatedText = URLDecoder.decode(encodedTranslated, StandardCharsets.UTF_8.toString());

            return translatedText;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    public LocalDateTime getTime(String s){
        List<ModelResult> results = DateTimeRecognizer.recognizeDateTime(s, "en-us");

        if (!results.isEmpty()) {
            ModelResult r = results.get(0);

            // resolution là Map<String, Object>
            Map<String, Object> resolution = r.resolution;
            List<Map<String, String>> values = (List<Map<String, String>>) resolution.get("values");
            System.out.println(values.get(0));
            String valueStr = values.get(0).get("value");  // ví dụ "2025-10-17 09:00:00"
            System.out.println(valueStr);
            // chuyển sang LocalDateTime
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime dateTime = LocalDateTime.parse(valueStr, formatter);
            return dateTime;
        }
        return null;
    }
    @GetMapping("/get-time-now")
    public ResponseEntity<String> getTimeNow(){
        LocalDateTime now = LocalDateTime.now();
        long millis = now.toInstant(ZoneOffset.UTC).toEpochMilli();
        return ResponseEntity.ok(millis+"");
    }
    public void setAlarm(){
        while(true) {
            LocalDateTime now = LocalDateTime.now();
            long millis = now.toInstant(ZoneOffset.UTC).toEpochMilli();
            long seconds = Math.round((double) millis / 1000);
            if (arrTime.contains(seconds)) {
                data.setType("bật đèn");
                arrTime.remove(seconds);
            }
            // Xóa tất cả phần tử nhỏ hơn seconds
            arrTime.headSet(seconds).clear();
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
