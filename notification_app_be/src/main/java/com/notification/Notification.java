package com.notification;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Notification {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @JsonProperty("ID")
    private String id;

    @JsonProperty("Type")
    private String type;

    @JsonProperty("Message")
    private String message;

    @JsonProperty("Timestamp")
    private String timestamp;

    public String getId()        { return id; }
    public String getType()      { return type; }
    public String getMessage()   { return message; }
    public String getTimestamp() { return timestamp; }

    public LocalDateTime getParsedTimestamp() {
        return LocalDateTime.parse(timestamp, FORMATTER);
    }

    /**
     * Type weight: Placement > Result > Event
     */
    public int getTypeWeight() {
        if (type == null) return 0;
        switch (type.trim()) {
            case "Placement": return 3;
            case "Result":    return 2;
            case "Event":     return 1;
            default:          return 0;
        }
    }

    @Override
    public String toString() {
        String shortId = (id != null && id.length() >= 8) ? id.substring(0, 8) : id;
        return String.format(
            "[%s] Type: %-12s | Message: %-35s | Time: %s",
            shortId, type, message, timestamp
        );
    }
}
