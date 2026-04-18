# Gereksinimler Belgesi

## Giriş

Kelk, Stellar blockchain ağı üzerinde çalışan, XLM kripto para birimi ile bahis yapılabilen bir satranç platformudur. Kullanıcılar Stellar cüzdanlarını bağlayarak birbirleriyle satranç oynayabilir, XLM üzerinden bahis açabilir ve kazandıklarında ödüllerini otomatik olarak alabilirler. Platform, kumarhane atmosferini yansıtan bir arayüzle React 19 + TypeScript + Vite üzerinde tamamen frontend tabanlı çalışır.

## Sözlük

- **Platform**: Kelk satranç bahis uygulaması
- **Oyuncu**: Stellar cüzdanı bağlamış ve oyun oynayan kullanıcı
- **Cüzdan**: Stellar Network üzerindeki XLM hesabı (Freighter veya benzeri)
- **Bahis**: İki oyuncu arasında XLM üzerinden yapılan anlaşma
- **Oyun_Motoru**: Tarayıcıda çalışan satranç mantığı bileşeni
- **Bahis_Yöneticisi**: Bahis oluşturma, eşleştirme ve ödeme akışını yöneten bileşen
- **Stellar_Köprüsü**: Stellar SDK ile cüzdan ve işlem yönetimini sağlayan bileşen
- **Tahta**: Satranç tahtası görsel bileşeni
- **XLM**: Stellar ağının yerel kripto para birimi (Lumen)
- **Lobi**: Açık bahislerin listelendiği ve oyun eşleştirmesinin yapıldığı ekran

---

## Gereksinimler

### Gereksinim 1: Satranç Oyunu Motoru

**Kullanıcı Hikayesi:** Bir oyuncu olarak, tarayıcıda tam kurallara uygun satranç oynamak istiyorum; böylece rakibimle adil bir oyun deneyimi yaşayabilirim.

#### Kabul Kriterleri

1. THE Oyun_Motoru SHALL tüm standart satranç hamlelerini (piyon, kale, at, fil, vezir, şah) FIDE kurallarına göre doğrulamalıdır.
2. THE Oyun_Motoru SHALL rok, en passant ve piyon terfisi özel hamlelerini desteklemelidir.
3. WHEN bir oyuncu geçersiz bir hamle yapmaya çalıştığında, THE Oyun_Motoru SHALL hamleyi reddetmeli ve görsel geri bildirim vermelidir.
4. THE Oyun_Motoru SHALL şah, şah mat ve pat durumlarını otomatik olarak tespit etmelidir.
5. WHEN şah mat veya pat durumu tespit edildiğinde, THE Oyun_Motoru SHALL oyunu sonlandırmalı ve sonucu Bahis_Yöneticisi'ne iletmelidir.
6. THE Oyun_Motoru SHALL her hamleyi FEN (Forsyth–Edwards Notation) formatında kaydetmelidir.
7. FOR ALL geçerli FEN dizileri, THE Oyun_Motoru SHALL FEN'i tahta durumuna dönüştürmeli, ardından tahta durumunu tekrar FEN'e dönüştürdüğünde eşdeğer bir FEN üretmelidir (round-trip özelliği).

---

### Gereksinim 2: Satranç Tahtası Arayüzü

**Kullanıcı Hikayesi:** Bir oyuncu olarak, sezgisel ve görsel açıdan çekici bir satranç tahtası görmek istiyorum; böylece oyunu kolayca oynayabilirim.

#### Kabul Kriterleri

1. THE Tahta SHALL 8x8 kare düzeninde tüm taşları doğru konumlarıyla göstermelidir.
2. WHEN bir oyuncu bir taşa tıkladığında, THE Tahta SHALL o taş için geçerli hamleleri vurgulayarak göstermelidir.
3. WHEN bir oyuncu geçerli bir hedef kareye tıkladığında, THE Tahta SHALL hamleyi gerçekleştirmeli ve tahtayı güncellenmiş durumda göstermelidir.
4. THE Tahta SHALL sürükle-bırak ile hamle yapılmasını desteklemelidir.
5. WHEN piyon son sıraya ulaştığında, THE Tahta SHALL oyuncuya terfi seçeneklerini (vezir, kale, fil, at) sunan bir modal göstermelidir.
6. THE Tahta SHALL kumarhane temasıyla uyumlu koyu renkli, lüks görünümlü bir tasarıma sahip olmalıdır.
7. THE Tahta SHALL son yapılan hamleyi farklı bir renk ile vurgulayarak göstermelidir.

---

### Gereksinim 3: Stellar Cüzdan Bağlantısı

**Kullanıcı Hikayesi:** Bir oyuncu olarak, Stellar cüzdanımı platforma bağlamak istiyorum; böylece XLM ile bahis yapabilir ve ödeme alabilir.

#### Kabul Kriterleri

1. THE Stellar_Köprüsü SHALL Freighter cüzdan uzantısı ile bağlantı kurabilmelidir.
2. WHEN bir oyuncu "Cüzdan Bağla" butonuna tıkladığında, THE Stellar_Köprüsü SHALL Freighter izin isteğini başlatmalıdır.
3. WHEN cüzdan başarıyla bağlandığında, THE Stellar_Köprüsü SHALL oyuncunun public key'ini ve XLM bakiyesini arayüzde göstermelidir.
4. IF Freighter uzantısı tarayıcıda yüklü değilse, THEN THE Stellar_Köprüsü SHALL oyuncuya Freighter'ı yüklemesi için yönlendirme bağlantısı içeren bir mesaj göstermelidir.
5. WHEN cüzdan bağlantısı kesildiğinde, THE Stellar_Köprüsü SHALL oyuncuyu oturumdan çıkarmalı ve aktif bahisleri iptal etmelidir.
6. THE Stellar_Köprüsü SHALL Stellar Mainnet ve Testnet ağlarını desteklemelidir.
7. WHILE cüzdan bağlı değilken, THE Platform SHALL bahis oluşturma ve oyuna katılma işlevlerini devre dışı bırakmalıdır.

---

### Gereksinim 4: Bahis Oluşturma

**Kullanıcı Hikayesi:** Bir oyuncu olarak, XLM miktarı belirleyerek bahis açmak istiyorum; böylece rakip bulup kazanç elde edebilirim.

#### Kabul Kriterleri

1. WHEN bağlı bir oyuncu bahis oluşturmak istediğinde, THE Bahis_Yöneticisi SHALL oyuncunun XLM miktarı ve zaman kontrolü (örn. 5+0, 10+5 dakika) girebileceği bir form sunmalıdır.
2. THE Bahis_Yöneticisi SHALL minimum 1 XLM, maksimum 10.000 XLM bahis miktarına izin vermelidir.
3. WHEN oyuncu bahis oluşturduğunda, THE Bahis_Yöneticisi SHALL bahis miktarının oyuncunun mevcut XLM bakiyesinden düşük veya eşit olduğunu doğrulamalıdır.
4. IF oyuncunun bakiyesi bahis miktarından düşükse, THEN THE Bahis_Yöneticisi SHALL işlemi reddetmeli ve yetersiz bakiye mesajı göstermelidir.
5. WHEN bahis başarıyla oluşturulduğunda, THE Bahis_Yöneticisi SHALL bahisi Lobi'de diğer oyunculara görünür hale getirmelidir.
6. THE Bahis_Yöneticisi SHALL oluşturulan bahse benzersiz bir tanımlayıcı atamalıdır.

---

### Gereksinim 5: Lobi ve Oyun Eşleştirme

**Kullanıcı Hikayesi:** Bir oyuncu olarak, açık bahisleri görmek ve katılmak istiyorum; böylece hızlıca rakip bulabilirim.

#### Kabul Kriterleri

1. THE Lobi SHALL tüm açık bahisleri XLM miktarı, zaman kontrolü ve oluşturulma zamanı bilgileriyle listelenmiş şekilde göstermelidir.
2. WHEN bir oyuncu açık bir bahse katılmak istediğinde, THE Bahis_Yöneticisi SHALL oyuncunun yeterli bakiyesi olduğunu doğrulamalıdır.
3. WHEN iki oyuncu eşleştiğinde, THE Bahis_Yöneticisi SHALL her iki oyuncudan da bahis miktarını rezerve etmeli ve oyunu başlatmalıdır.
4. THE Lobi SHALL bahis listesini gerçek zamanlı olarak (en fazla 5 saniyede bir) güncellenmiş şekilde göstermelidir.
5. WHILE bir oyuncu aktif oyundayken, THE Platform SHALL o oyuncunun yeni bahis oluşturmasını veya başka bir bahse katılmasını engellemelidir.
6. THE Lobi SHALL bahisleri XLM miktarına göre sıralama ve filtreleme imkânı sunmalıdır.

---

### Gereksinim 6: XLM Ödeme İşlemleri

**Kullanıcı Hikayesi:** Bir oyuncu olarak, kazandığımda XLM ödülümü otomatik olarak almak istiyorum; böylece güvenli ve şeffaf bir ödeme deneyimi yaşayabilirim.

#### Kabul Kriterleri

1. WHEN oyun sona erdiğinde ve kazanan belirlendiğinde, THE Stellar_Köprüsü SHALL toplam bahis miktarını (her iki oyuncunun koyduğu XLM) kazanan oyuncunun cüzdanına transfer etmelidir.
2. WHEN beraberlik durumu oluştuğunda, THE Stellar_Köprüsü SHALL her oyuncunun koyduğu XLM miktarını ilgili oyuncuya iade etmelidir.
3. THE Stellar_Köprüsü SHALL her ödeme işlemini Stellar ağına göndermeden önce oyuncunun cüzdan imzasını talep etmelidir.
4. IF Stellar ağı işlemi başarısız olursa, THEN THE Stellar_Köprüsü SHALL işlemi en fazla 3 kez yeniden denemeli ve başarısız olursa oyuncuya hata mesajı göstermelidir.
5. THE Stellar_Köprüsü SHALL her işlem için Stellar işlem hash'ini arayüzde göstermeli ve Stellar Explorer bağlantısı sunmalıdır.
6. THE Platform SHALL platform işlem ücreti olarak toplam bahis miktarının %2'sini kesmelidir.

---

### Gereksinim 7: Oyun Süresi ve Zaman Kontrolü

**Kullanıcı Hikayesi:** Bir oyuncu olarak, belirlenen süre içinde hamle yapmak istiyorum; böylece oyun adil ve hızlı ilerlesin.

#### Kabul Kriterleri

1. THE Oyun_Motoru SHALL her oyuncu için bağımsız geri sayım saati tutmalıdır.
2. WHEN bir oyuncu hamle yaptığında, THE Oyun_Motoru SHALL o oyuncunun saatini durdurmalı ve rakibin saatini başlatmalıdır.
3. WHEN bir oyuncunun süresi dolduğunda, THE Oyun_Motoru SHALL o oyuncuyu kaybeden ilan etmeli ve Bahis_Yöneticisi'ni bilgilendirmelidir.
4. THE Oyun_Motoru SHALL kalan süreyi saniye hassasiyetinde arayüzde göstermelidir.
5. WHERE artı zaman (increment) seçeneği etkinleştirilmişse, THE Oyun_Motoru SHALL her hamle sonrasında belirlenen saniyeyi oyuncunun süresine eklemeli.

---

### Gereksinim 8: Oyun Geçmişi ve İstatistikler

**Kullanıcı Hikayesi:** Bir oyuncu olarak, geçmiş oyunlarımı ve istatistiklerimi görmek istiyorum; böylece gelişimimi takip edebilirim.

#### Kabul Kriterleri

1. THE Platform SHALL her tamamlanan oyunu (oyuncular, sonuç, bahis miktarı, tarih, hamle listesi) yerel depolama (localStorage) üzerinde saklamalıdır.
2. THE Platform SHALL oyuncunun toplam oyun sayısını, kazanma oranını ve toplam XLM kazancını/kaybını göstermelidir.
3. WHEN bir oyuncu geçmiş oyuna tıkladığında, THE Platform SHALL o oyunun hamle listesini tekrar oynatma (replay) imkânı sunmalıdır.
4. THE Platform SHALL oyun geçmişini en fazla son 100 oyunla sınırlandırmalıdır.

---

### Gereksinim 9: Kumarhane Teması ve Kullanıcı Deneyimi

**Kullanıcı Hikayesi:** Bir oyuncu olarak, lüks kumarhane atmosferini yansıtan bir arayüzde oynamak istiyorum; böylece heyecan verici bir deneyim yaşayabilirim.

#### Kabul Kriterleri

1. THE Platform SHALL koyu arka plan, altın/sarı vurgu renkleri ve yeşil satranç tahtası renk şemasını kullanan bir kumarhane teması uygulamalıdır.
2. THE Platform SHALL hamle yapıldığında, bahis oluşturulduğunda ve oyun kazanıldığında ses efektleri çalmalıdır.
3. THE Platform SHALL oyun kazanıldığında konfeti veya parıltı animasyonu göstermelidir.
4. THE Platform SHALL mobil cihazlarda (320px - 768px genişlik) tam işlevsel ve kullanılabilir olmalıdır.
5. THE Platform SHALL tüm etkileşimli öğeler için yükleme durumlarını (loading spinner veya skeleton) göstermelidir.
6. WHEN bir işlem gerçekleştiğinde, THE Platform SHALL kullanıcıya toast bildirimi ile geri bildirim vermelidir.
