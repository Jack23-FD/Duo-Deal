package com.duodeals.backend.service;

import com.duodeals.backend.entity.Duel;
import com.duodeals.backend.entity.DuelTask;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${server.port:8080}")
    private String serverPort;

    public void sendDuelInvitation(String recipientEmail, Duel duel, List<DuelTask> tasks) {
        String challengerName = duel.getChallenger().getUsername();
        String challengerAvatar = duel.getChallenger().getProfilePhotoUrl() != null 
                ? duel.getChallenger().getProfilePhotoUrl() 
                : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + challengerName;
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String startDateStr = duel.getStartDate().format(formatter);
        String endDateStr = duel.getEndDate().format(formatter);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(recipientEmail);
            helper.setFrom("noreply@duodeals.com", challengerName);
            helper.setSubject("⚔️ Duo Deals Duel Invitation from " + challengerName + "!");

            // Construct tasks HTML
            StringBuilder tasksHtml = new StringBuilder();
            tasksHtml.append("<ul style='list-style-type:none; padding:0; margin:15px 0;'>");
            for (DuelTask t : tasks) {
                String timeStr = t.getTaskTime() != null ? " (" + t.getTaskTime() + ")" : "";
                tasksHtml.append("<li style='background:#f1f5f9; padding:10px 14px; border-radius:8px; margin-bottom:8px; border-left:4px solid #f97316; font-weight:500;'>")
                         .append("🏃 ").append(t.getTaskName()).append(timeStr)
                         .append("</li>");
            }
            tasksHtml.append("</ul>");

            // Base URLs for Option A Accept/Reject
            String acceptUrl = "http://localhost:" + serverPort + "/api/duels/" + duel.getId() + "/accept";
            String rejectUrl = "http://localhost:" + serverPort + "/api/duels/" + duel.getId() + "/reject";

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>⚔️ Duo Deals Duel Invite</title>
                </head>
                <body style="font-family: 'Outfit', sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
                    <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden;">
                        
                        <!-- Header banner -->
                        <div style="background: linear-gradient(90deg, #f97316 0%%, #3b82f6 100%%); padding: 32px 24px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">⚔️ HABIT DUEL CHALLENGE</h1>
                        </div>
                        
                        <!-- Body content -->
                        <div style="padding: 28px 24px; text-align: center;">
                            <img src="%s" alt="%s" style="width: 80px; height: 80px; border-radius: 50%%; border: 3px solid #f97316; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 16px; object-fit: cover;" />
                            
                            <p style="font-size: 16px; margin-top: 0; line-height: 1.6; text-align: left;">
                                Hi <strong>%s</strong>,
                            </p>
                            <p style="font-size: 15px; line-height: 1.6; text-align: left;">
                                <strong>%s</strong> challenged you to a habit battle
                            </p>
                            
                            <!-- Date Range -->
                            <div style="background: #eff6ff; padding: 14px; border-radius: 12px; margin: 20px 0; text-align: center; border: 1px solid #bfdbfe;">
                                <span style="font-size: 12px; font-weight: 700; color: #2563eb; display: block; text-transform: uppercase; letter-spacing: 0.5px;">DUEL DURATION</span>
                                <span style="font-size: 16px; font-weight: 600; color: #1e3a8a; margin-top: 4px; display: block;">%s &mdash; %s</span>
                            </div>
                            
                            <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: left;">DAILY HABIT TASKS</h3>
                            %s
                            
                            <p style="font-size: 14px; color: #64748b; margin-top: 20px; text-align: left;">
                                Ready to take on the duel and level up your consistency? Respond below to lock in the battle.
                            </p>
                            
                            <!-- CTA Buttons -->
                            <div style="display: flex; gap: 12px; margin-top: 28px; justify-content: center;">
                                <a href="%s" style="flex: 1; text-align: center; background-color: #22c55e; color: white; padding: 14px 20px; font-weight: 600; font-size: 15px; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);">
                                    Accept Challenge
                                </a>
                                <a href="%s" style="flex: 1; text-align: center; background-color: #ef4444; color: white; padding: 14px 20px; font-weight: 600; font-size: 15px; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);">
                                    Reject
                                </a>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 11px; color: #94a3b8;">Powered by modern habit-pairing tech. Duo Deals.</span>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        challengerAvatar,
                        challengerName,
                        duel.getOpponent().getUsername(),
                        challengerName,
                        startDateStr,
                        endDateStr,
                        tasksHtml.toString(),
                        acceptUrl,
                        rejectUrl
                );

            helper.setText(htmlContent, true);
            
            // Note: In real production setups with valid SMTP, this actually fires:
            mailSender.send(message);
            log.info("Successfully sent duel invitation email to opponent: {}", recipientEmail);
            
        } catch (Exception e) {
            log.error("Failed to send duel invitation email to {}. Error: {}", recipientEmail, e.getMessage());
            log.info("Accept link: {}", "http://localhost:" + serverPort + "/api/duels/" + duel.getId() + "/accept");
            log.info("Reject link: {}", "http://localhost:" + serverPort + "/api/duels/" + duel.getId() + "/reject");
        }
    }
}
