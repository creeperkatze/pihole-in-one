---
title: FAQ
---

# Häufig gestellte Fragen

Antworten auf Fragen, die dir vielleicht begegnen, bevor oder nachdem du auf sie gestoßen bist.

## Verbindung

### Welche Pi-hole-Versionen werden unterstützt?

Nur Pi-hole v6. Die Erweiterung nutzt die v6-API von Pi-hole mit deinem Admin-Passwort oder einem App-Passwort, nicht das alte API-Token aus v5. Wenn du noch v5 verwendest, aktualisiere zuerst Pi-hole.

### Was gebe ich als Passwort ein?

Das normale Admin-Passwort deines Pi-holes, mit dem du dich auch im Webinterface anmeldest, funktioniert problemlos und ist das, was die meisten eingeben. Wenn du das lieber nicht verwenden möchtest, kannst du stattdessen unter **Einstellungen > API** ein separates **App-Passwort** erstellen und dieses verwenden. Beides funktioniert. Das ist etwas anderes als das API-Token aus Pi-hole v5. Wenn für dein Pi-hole kein Passwort gesetzt ist, lass das Feld leer.

### Ich habe das richtige Passwort eingegeben, aber es wird trotzdem als falsch angezeigt

Prüfe, ob du das aktuelle Admin-Passwort verwendest, oder das App-Passwort, falls du unter **Einstellungen > API** eines eingerichtet hast. Wenn du eines davon kürzlich geändert hast, aktualisiere es auch in den Verbindungseinstellungen der Erweiterung. Ein veraltetes Passwort in der Erweiterung schlägt weiter fehl, auch nachdem du es auf der Pi-hole-Seite korrigiert hast.

### Die Erweiterung erreicht mein Pi-hole überhaupt nicht

Häufige Ursachen:

- **Falsches URL-Format:** Gib nur den Host an, z. B. `http://pi.hole` oder `http://192.168.1.1`, ohne abschließenden Schrägstrich und ohne `/api` am Ende.
- **Nicht im selben Netzwerk / VPN:** Wenn dein Pi-hole nur in deinem LAN erreichbar ist, musst du mit diesem Netzwerk verbunden sein, damit die Erweiterung es erreicht.
- **Falsches Protokoll:** Wenn die Admin-Oberfläche deines Pi-holes nur über `http://` erreichbar ist, schlägt die Verbindung mit `https://` fehl (und umgekehrt).

### Warum hat der Browser beim Hinzufügen eines Pi-holes nach einer Berechtigung gefragt?

Browsererweiterungen können nicht unbemerkt Anfragen an beliebige Hosts senden. Wenn du ein Pi-hole hinzufügst, fragt die Erweiterung nach der Berechtigung für genau diesen Host, damit sie mit ihm kommunizieren kann.

### Mein Pi-hole verwendet ein selbstsigniertes HTTPS-Zertifikat

Dein Browser blockiert die Verbindung, bis er diesem Zertifikat vertraut, genauso wie er den direkten Aufruf der Seite in einem Tab blockieren würde. Du musst das lokale Zertifikat manuell als vertrauenswürdiges Stammzertifikat auf deinem Gerät hinzufügen.

### Kann ich mich mit einem Pi-hole hinter einem Reverse Proxy oder auf einem anderen Port verbinden?

Ja, gib den Port in der URL an (z. B. `http://pi.hole:8080`). Ein Unterpfad hinter einem Reverse Proxy funktioniert auch. Achte nur darauf, dass die eingegebene URL zur Admin-Oberfläche des Pi-holes führt.

## Mehrere Pi-holes

### Kann ich mehr als ein Pi-hole verwalten?

Ja, füge in den Verbindungseinstellungen der Erweiterung so viele hinzu, wie du möchtest. Das Popup zeigt für jedes einen Tab, damit du zwischen ihnen wechseln kannst.

### Werden mehrere Pi-holes synchronisiert?

Nein, jede Verbindung ist unabhängig. Das Umschalten der Blockierung oder das Verwalten von Listen auf einem Pi-hole wirkt sich nicht auf die anderen aus.

## Datenschutz & Daten

### Bleiben mein Passwort und meine Pi-hole-Daten lokal?

Ja. Die Erweiterung kommuniziert direkt von deinem Browser mit der Adresse deines Pi-holes. Nichts wird über einen Server geleitet.

### Wo werden meine Einstellungen und Passwörter gespeichert?

Lokal im Erweiterungsspeicher deines Browsers. Sie bleiben auf deinem Gerät und werden nicht zwischen Browsern oder Geräten synchronisiert.

### Steht die Erweiterung in Verbindung mit dem offiziellen Pi-hole-Projekt?

Nein, es ist ein unabhängiges Projekt und wird von Pi-hole weder unterstützt noch empfohlen.

## Verhalten

### Ich habe eine Domain auf die Whitelist gesetzt oder blockiert, aber ein Gerät löst sie noch wie vorher auf

Dein Gerät hat das Ergebnis möglicherweise zwischengespeichert, entweder im eigenen DNS-Cache oder im Browser. Warte einen Moment oder starte den Browser neu.

### Das Abzeichen in der Symbolleiste aktualisiert sich nicht sofort

Das Abzeichen wird in regelmäßigen Abständen aktualisiert, nicht bei jeder Anfrage, und Browser können Hintergrundaktivitäten von Erweiterungen im Leerlauf drosseln, um Ressourcen zu sparen. Eine kurze Verzögerung nach einer Änderung auf der Pi-hole-Seite ist normal.
