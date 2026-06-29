# LogiOs

LogiOs est un ordinateur virtuel concu a partir d'un processeur 8 bits. Le projet a ete concu a l'aide de [Logisim](http://www.cburch.com/logisim/) pour simuler un processeur et son architecture. Ce projet inclut egalement un compilateur en Node.js, qui facilite l'ecriture et la compilation des instructions pour le processeur.

---

## Fonctionnalites

- **Architecture 8 bits** : Processeur a 7 registres de 8 bits
- **Simulation Logisim** : Circuit logique complet du processeur, visualisable et simulable
- **Compilateur Node.js** : Pipeline lexer -> parser -> compiler transformant l'assembleur en binaire

---

## Prerequis

- [Node.js](https://nodejs.org/) version >= 14
- [Logisim](http://www.cburch.com/logisim/) (Java requis)

## Installation

```bash
git clone https://github.com/zionhigt/lOGIos.git
cd lOGIos
```

## Utilisation

### Compiler un programme

```bash
node compile/index.js
```

Le compilateur lit le fichier `compile/code/run.svbin`, le compile et ecrit le binaire dans `VM_logicim/logi.prog`.

### Simuler le processeur

Ouvrir le fichier `VM_logicim/ordi_logic.circ` dans Logisim. Le programme compile est charge automatiquement depuis `logi.prog`.

---

## Structure du Projet

```
lOGIos/
  compile/
    index.js          # Point d'entree du compilateur
    lexer.js           # Analyse lexicale (tokenisation)
    parser.js          # Analyse syntaxique (AST)
    compiler.js        # Generation du binaire
    code/
      run.svbin        # Programme source en assembleur
  VM_logicim/
    ordi_logic.circ    # Circuit Logisim du processeur
    logi.prog          # Programme compile (binaire)
  doc/
    VM_doc_technique.pdf
```

---

## Jeu d'Instructions

### Modele d'Instruction (4 octets / 32 bits)

Chaque instruction est encodee sur 4 octets :

```
 Bit (24-31)      Bit (16-23)      Bit (8-15)       Bit (0-7)
+-----------------+-----------------+-----------------+-----------------+
|    Pilotage     |   Registre A    |   Registre B    |     Output      |
+-----------------+-----------------+-----------------+-----------------+
```

### Octet de Pilotage - Bit (24-31)

L'octet de pilotage controle le comportement de l'instruction :

```
 Bit 31  Bit 30  Bit 29  Bit 28  Bit 27  Bit 26  Bit 25  Bit 24
+-------+-------+-------+-------+-------+-------+-------+-------+
| Fonction (2b) | A typ | B typ |         Opcode (4b)           |
+-------+-------+-------+-------+-------+-------+-------+-------+
```

#### Bit (30-31) : Fonction

| Fonction    | Code |
|-------------|------|
| **ALU**     | `00` |
| **MOV**     | `01` |
| **COMPARE** | `10` |
| **JMP**     | `11` |

#### Bit (29) : Type Registre A / Bit (28) : Type Registre B

| Valeur | Signification       |
|--------|----------------------|
| `0`    | Valeur directe       |
| `1`    | Adresse de registre  |

Ces bits pilotent si les valeurs dans Registre A et Registre B sont des valeurs immediates ou des adresses de registres.

---

### Opcodes - Bit (24-27)

#### ALU (Fonction `00`)

Ecrit le resultat dans le registre a l'adresse lue dans Output Bit(0-7).

| Methode  | Code   |
|----------|--------|
| **OR**   | `0000` |
| **AND**  | `0001` |
| **XOR**  | `0010` |
| **ADD**  | `0011` |
| **SUB**  | `0100` |
| **NOR**  | `1000` |
| **NAND** | `1001` |
| **NXOR** | `1010` |

Syntaxe :
```
<op> <A> <B> <dest>
```

#### MOV (Fonction `01`)

| Methode | Code   |
|---------|--------|
| **MOV** | `0000` |

Syntaxe :
```
mov <valeur> <dest>
```

#### COMPARE (Fonction `10`)

Ecrit le resultat dans le registre R1.

| Methode | Code   | Comparaison |
|---------|--------|-------------|
| **GT**  | `0000` | `>`         |
| **EQ**  | `0001` | `=`         |
| **LT**  | `0010` | `<`         |
| **NGT** | `0100` | `<=`        |
| **NEQ** | `0101` | `!=`        |
| **NLT** | `0110` | `>=`        |

Syntaxe :
```
<op> <A> <B>
```

#### JMP (Fonction `11`)

Saute a l'instruction a l'adresse lue dans le Registre A, si la condition sur R1 est remplie.

| Methode  | Code   | Condition  |
|----------|--------|------------|
| **JGZ**  | `0000` | R1 > 0     |
| **JEZ**  | `0001` | R1 = 0     |
| **JLZ**  | `0010` | R1 < 0     |
| **JNGZ** | `0100` | R1 <= 0    |
| **JNEZ** | `0101` | R1 != 0    |
| **JNLZ** | `0110` | R1 >= 0    |

Syntaxe :
```
<op> <adresse>
jmp <adresse>        # saut inconditionnel
```

> **Astuce : `jmp` — hack de compilation**
>
> L'instruction `jmp` (saut inconditionnel) n'existe pas nativement dans le processeur.
> C'est un hack de compilation. Les conditions de saut utilisent 2 bits de l'opcode
> pour selectionner le test sur R1 :
>
> ```
> Bit 25  Bit 24    Condition
>   0       0       GT  (R1 > 0)
>   0       1       EQ  (R1 = 0)
>   1       0       LT  (R1 < 0)
>   1       1       ???  -> toujours vrai
> ```
>
> L'opcode `0011` met les deux bits de condition a `1` simultanement.
> Dans le circuit Logisim, cet etat non prevu est interprete comme une condition
> toujours satisfaite, ce qui produit un saut inconditionnel.
> Le compilateur genere l'octet de pilotage `0xC3` (fonction JMP `11` + opcode `0011`).

#### STOP

Arrete l'execution du processeur.

```
stop
```

---

## Registres

Le processeur dispose de 7 registres de 8 bits :

| Nom  | Adresse |
|------|---------|
| R1   | `0x00`  |
| R2   | `0x01`  |
| R3   | `0x02`  |
| R4   | `0x03`  |
| R5   | `0x04`  |
| R6   | `0x05`  |
| R7   | `0x06`  |

---

## Labels

Les labels permettent de nommer des positions dans le programme pour les sauts :

```
:<NOM>
```

Ils sont resolus a la compilation en adresses d'instructions.

---

## Exemple : Multiplication (6 x 8)

Multiplier 6 x 8 par additions successives, resultat dans R3 :

```asm
mov 6 r1
mov 8 r2
mov 0 r3
:loop
    sub r1 1 r1
    add r2 r3 r3
    jnez loop
    jmp endloop
:end
    stop
:endloop
    jmp end
```

**Deroulement :**
1. R1 = 6 (compteur), R2 = 8 (valeur a additionner), R3 = 0 (accumulateur)
2. A chaque iteration : R1 decremente de 1, R3 += R2
3. Quand R1 != 0, on reboucle sur `:loop`
4. Quand R1 = 0, on saute a `:endloop` puis `:end` pour `stop`
5. Resultat : R3 = 48
