# Formato file XLF

## Struttura del file

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="it" datatype="plaintext" original="ng2.template">
    <body>
      <!-- Entry esistente -->
      <trans-unit id="UUID-esistente">
        <source>Testo sorgente IT</source>
        <target state="final">Testo sorgente IT</target>
      </trans-unit>
      <!-- ... -->
    </body>
  </file>
</xliff>
```

Per EN e DE cambia solo `source-language` e i valori in `<target>`.

## Aggiungere una nuova entry

```xml
<trans-unit id="a1b2c3d4-e5f6-4789-abcd-ef0123456789">
  <source>Testo sorgente</source>
  <target state="final">Traduzione nella lingua del file</target>
</trans-unit>
```

**Regole:**
- `id` = UUID v4 generato dalla skill
- `<source>` = testo originale (uguale in tutti i file XLF)
- `<target state="final">` = traduzione nella lingua del file
- Aggiungere **dopo l'ultima entry** esistente, prima di `</body>`

## Corrispondenza lingue

| File | `source-language` | Lingua traduzione in `<target>` |
|---|---|---|
| `private.messages.it.xlf` | `it` | Italiano (= sorgente) |
| `private.messages.en.xlf` | `en` | Inglese |
| `private.messages.de.xlf` | `de` | Tedesco |

## Entry da aggiungere — esempio completo

Testo: "Elimina tutti"

**private.messages.it.xlf:**
```xml
<trans-unit id="a1b2c3d4-e5f6-4789-abcd-ef0123456789">
  <source>Elimina tutti</source>
  <target state="final">Elimina tutti</target>
</trans-unit>
```

**private.messages.en.xlf:**
```xml
<trans-unit id="a1b2c3d4-e5f6-4789-abcd-ef0123456789">
  <source>Elimina tutti</source>
  <target state="final">Delete all</target>
</trans-unit>
```

**private.messages.de.xlf:**
```xml
<trans-unit id="a1b2c3d4-e5f6-4789-abcd-ef0123456789">
  <source>Elimina tutti</source>
  <target state="final">Alle löschen</target>
</trans-unit>
```

## Verifica

Dopo aver aggiunto le entry, verificare che:
1. Lo stesso UUID esista in TUTTI i file XLF configurati
2. Non ci siano UUID duplicati
3. La formattazione XML sia valida
4. `state="final"` sia presente
