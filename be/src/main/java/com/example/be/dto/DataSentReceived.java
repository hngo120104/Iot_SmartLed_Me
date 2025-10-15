package com.example.be.dto;

public class DataSentReceived {
    private String type;
    private Object obj;

    public DataSentReceived() {
        type="tắt đèn";
    }

    public DataSentReceived(String type, Object obj) {
        this.type = type;
        this.obj = obj;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getObj() {
        return obj;
    }

    public void setObj(Object obj) {
        this.obj = obj;
    }
}
