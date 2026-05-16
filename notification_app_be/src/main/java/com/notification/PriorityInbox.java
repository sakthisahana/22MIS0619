package com.notification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Priority Inbox - Stage 1
 *
 * Fetches notifications from the API and displays the top N
 * most important unread notifications based on:
 *   - Type weight: Placement (3) > Result (2) > Event (1)
 *   - Recency: newer notifications score higher among same type
 *
 * Score formula:
 *   score = typeWeight * 1000 + recencyScore * 999
 *
 * To maintain top-N efficiently as new notifications arrive,
 * a Min-Heap (PriorityQueue) of size N is used:
 *   - Insert new notification → if size > N, remove lowest scored
 *   - O(log N) per insertion, always maintains top N
 */
public class PriorityInbox {

    // ⚠️  Replace with your actual Bearer token from the evaluation platform
    private static final String API_URL =
            "http://4.224.186.213/evaluation-service/notifications";
    private static final String AUTH_TOKEN =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzYWt0aGlkaGFrc2gxMDEyQGdtYWlsLmNvbSIsImV4cCI6MTc3ODkzMDU1OCwiaWF0IjoxNzc4OTI5NjU4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMGFmNTlhMjAtMjRkMC00NzMyLTk1NGYtNWYwNzI1MWQ5OWZiIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2FrdGhpIHNhaGFuYSBkIiwic3ViIjoiNDE0MjA3NzItODBjNC00MjFlLWE0NzMtYjUzZGQ5Zjc0ZGZlIn0sImVtYWlsIjoic2FrdGhpZGhha3NoMTAxMkBnbWFpbC5jb20iLCJuYW1lIjoic2FrdGhpIHNhaGFuYSBkIiwicm9sbE5vIjoiMjJtaXMwNjE5IiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiNDE0MjA3NzItODBjNC00MjFlLWE0NzMtYjUzZGQ5Zjc0ZGZlIiwiY2xpZW50U2VjcmV0IjoiR0pQZGhkcmZyZG53VGZ5USJ9.ltWI-IBAaEspPqQ3VANnd_OlDPHXq8i3fLIyXSckPdM";

    // Change this to 15, 20, etc. based on user preference
    private static final int TOP_N = 10;

    public static void main(String[] args) throws Exception {

        System.out.println("==============================================");
        System.out.println("   Campus Notifications - Priority Inbox     ");
        System.out.println("==============================================\n");

        // 1. Fetch all notifications from API
        System.out.println("Fetching notifications from API...");
        List<Notification> all = fetchNotifications();
        System.out.println("Total notifications fetched: " + all.size() + "\n");

        // 2. Get top N by priority score
        List<Notification> topN = getPriorityInbox(all, TOP_N);

        // 3. Display results
        System.out.println("===== TOP " + TOP_N + " PRIORITY NOTIFICATIONS =====\n");
        for (int i = 0; i < topN.size(); i++) {
            System.out.printf("%-3d %s%n", (i + 1), topN.get(i));
        }

        System.out.println("\n==============================================");
        System.out.println("Priority Order: Placement > Result > Event");
        System.out.println("Tie-breaker: Most recent first");
        System.out.println("==============================================");
    }

    /**
     * Fetches notifications from the protected API endpoint.
     */
    public static List<Notification> fetchNotifications() throws Exception {
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
                .build();

        Request request = new Request.Builder()
                .url(API_URL)
                .addHeader("Authorization", "Bearer " + AUTH_TOKEN)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException(
                    "API call failed with status: " + response.code() +
                    " - " + response.message()
                );
            }

            String body = response.body().string();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(body);
            JsonNode notifArray = root.get("notifications");

            if (notifArray == null || !notifArray.isArray()) {
                throw new RuntimeException("Unexpected API response format");
            }

            List<Notification> list = new ArrayList<>();
            for (JsonNode node : notifArray) {
                Notification n = mapper.treeToValue(node, Notification.class);
                list.add(n);
            }
            return list;
        }
    }

    /**
     * Returns top N notifications sorted by priority score.
     *
     * For efficiently handling new incoming notifications,
     * uses a Min-Heap approach: maintain a PriorityQueue of size N
     * keyed by score — insert is O(log N), always yields top N.
     */
    public static List<Notification> getPriorityInbox(
            List<Notification> notifications, int topN) {

        if (notifications == null || notifications.isEmpty()) {
            return Collections.emptyList();
        }

        // Find most recent timestamp for recency normalization
        LocalDateTime maxTime = notifications.stream()
                .map(Notification::getParsedTimestamp)
                .max(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());

        // Min-Heap: smallest score at top, so we can evict cheaply
        PriorityQueue<Notification> minHeap = new PriorityQueue<>(
                topN + 1,
                Comparator.comparingDouble(n -> computeScore(n, maxTime))
        );

        for (Notification n : notifications) {
            minHeap.offer(n);
            if (minHeap.size() > topN) {
                minHeap.poll(); // remove lowest-scored
            }
        }

        // Extract and sort descending for display
        List<Notification> result = new ArrayList<>(minHeap);
        result.sort((a, b) -> Double.compare(
                computeScore(b, maxTime),
                computeScore(a, maxTime)
        ));
        return result;
    }

    /**
     * Computes priority score for a notification.
     * Score = typeWeight * 1000 + recencyScore * 999
     */
    private static double computeScore(Notification n, LocalDateTime maxTime) {
        LocalDateTime time = n.getParsedTimestamp();
        long secondsDiff = Duration.between(time, maxTime).getSeconds();

        // Normalize recency over a 7-day window (604800 seconds)
        double maxSeconds = 7 * 24 * 3600.0;
        double recencyScore = 1.0 - Math.min(secondsDiff / maxSeconds, 1.0);

        return n.getTypeWeight() * 1000.0 + recencyScore * 999.0;
    }
}
