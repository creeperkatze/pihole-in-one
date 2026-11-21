---
title: FAQ
---

# Často kladené dotazy

Odpovědi na otázky, na které můžete narazit před nebo po jejich vyřešení.

## Připojování

### Které verze Pi-hole jsou podporovány?

Pouze Pi-hole v6. Rozšíření komunikuje s API verze 6 od Pi-hole pomocí vašeho administrátorského hesla nebo hesla aplikace, nikoli pomocí starého API tokenu z verze 5. Pokud stále používáte verzi 5, nejprve proveďte aktualizaci Pi-hole.

### Co mám zadat jako heslo?

Běžné administrátorské heslo vašeho Pi-hole, které používáte k přihlášení do webového rozhraní, funguje dobře a většina lidí ho zadává. Pokud to nechcete používat, můžete si místo toho vytvořit samostatné **heslo aplikace** v části **Nastavení > API** a použít to. Obojí funguje. To se liší od API tokenu používaného v Pi-hole v5. Pokud vaše Pi-hole nemá nastavené heslo, nechte pole prázdné.

### Zadal jsem správné heslo, ale stále se zobrazuje hlášení o nesprávném hesle

Zkontrolujte, zda používáte aktuální heslo správce, případně heslo aplikace, pokud jste si jej samostatně nastavili v části **Nastavení > API**. Pokud jste nedávno změnili některou z těchto hodnot, aktualizujte ji také v nastavení připojení daného rozšíření. Zastaralé heslo uložené v rozšíření bude i nadále vykazovat chybu, i když jej na straně Pi-hole opravíte.

### Toto rozšíření se k mému Pi-hole vůbec nemůže připojit

Časté příčiny:

- **Nesprávný formát URL:** Použijte pouze název hostitele, např. `http://pi.hole` nebo `http://192.168.1.1`, bez koncové lomítka a bez přípony `/api`.
- **Není ve stejné síti / VPN:** Pokud je váš Pi-hole dostupný pouze ve vaší lokální síti (LAN), musíte být připojeni k této síti, aby se k němu rozšíření mohlo připojit.
- **Nesprávný protokol:** Pokud je administrační rozhraní vašeho Pi-hole dostupné pouze na adrese `http://`, pokus o připojení pomocí adresy `https://` (nebo naopak) selže.

### Proč mě prohlížeč požádal o svolení, když jsem přidal Pi-hole?

Rozšíření prohlížeče nemohou bez upozornění odesílat požadavky na libovolné servery. Při přidání Pi-hole si rozšíření vyžádá oprávnění pro daný konkrétní hostitel, aby s ním mohlo komunikovat.

### Můj Pi-hole používá vlastnoručně podepsaný certifikát HTTPS

Váš prohlížeč zablokuje připojení, dokud tomuto certifikátu neudělí důvěru, stejně jako by zablokoval přímý přístup na daný web v záložce. Místní certifikát musíte ve svém zařízení ručně přidat jako důvěryhodný kořenový certifikát.

### Mohu se připojit k Pi-hole, který běží za reverzním proxy nebo na nestandardním portu?

Ano, do adresy URL uveďte číslo portu (např. `http://pi.hole:8080`). Funguje i podadresář s reverzním proxy – stačí se ujistit, že zadaná URL adresa vede k administračnímu rozhraní Pi-hole.

## Více Pi-hole

### Mohu spravovat více než jeden Pi-hole?

Ano, v nastavení připojení tohoto rozšíření si jich můžete přidat, kolik chcete. Vyskakovací okno ukazuje záložku pro každou z nich, abyste mezi nimi mohli přepínat.

### Synchronizuje se více Pi-holes?

Ne, každé spojení je nezávislé. Přepínání blokování nebo správa seznamů na jednom Pi-hole nemá na ostatní žádný vliv.

## Soukromí a data

### Zůstávají moje heslo a data z Pi-hole uloženy lokálně?

Ano. Toto rozšíření komunikuje přímo z vašeho prohlížeče s adresou vašeho Pi-hole. Žádný provoz není směrován přes server.

### Kde jsou uložena moje nastavení a hesla?

Lokálně, v úložišti rozšíření vašeho prohlížeče. Zůstávají ve vašem zařízení a nejsou synchronizovány mezi prohlížeči ani zařízeními.

### Je toto rozšíření spojeno s oficiálním projektem Pi-hole?

Ne, jedná se o nezávislý projekt, který není spojen s Pi-hole ani jím není podporován.

## Chování

### Doménu jsem zařadil na seznam povolených/zablokovaných, ale zařízení ji stále vyhodnocuje starým způsobem

Vaše zařízení může mít tento výsledek uložený v mezipaměti, a to buď ve vlastní mezipaměti DNS resolveru, nebo v prohlížeči. Počkejte chvilku nebo restartujte prohlížeč.

### Zdá se, že ikona na panelu nástrojů se neaktualizuje okamžitě

Odznak se aktualizuje v určitých intervalech, nikoli okamžitě při každém dotazu, a prohlížeče mohou omezit činnost rozšíření na pozadí, aby v době nečinnosti šetřily zdroje. Po provedení změny na straně Pi-hole je třeba počítat s krátkým zpožděním.
