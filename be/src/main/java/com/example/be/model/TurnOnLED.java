package com.example.be.model;

public class TurnOnLED {
    private int r;
    private int g;
    private int b;
    private int level;

    public TurnOnLED() {
        r=255;
        g=0;
        b=0;
        level=4;
    }

    public TurnOnLED(int r, int g, int b, int level) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.level = level;
    }

    public int getR() {
        return r;
    }

    public void setR(int r) {
        this.r = r;
    }

    public int getG() {
        return g;
    }

    public void setG(int g) {
        this.g = g;
    }

    public int getB() {
        return b;
    }

    public void setB(int b) {
        this.b = b;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }
}
