import React from "react";
import { useState, useEffect } from "react";

export default function SchedulePlan() {
    const [plan, setPlan] = useState("");

    return (
        <div className="schedule-plan-container">
            <h2>Schedule Plan</h2>
            <br/>
            <label>+</label>
        </div>
    )
}