# 第5章 既存の設計手法との比較

UI Boundary Architecture は、Atomic Design や Islands Architecture を置き換えるために作られたものではありません。分類の基準が違うため、**同じ画面に対して別のことを言っています。**

この章では、それぞれと何が違い、どこまで併用できるのかを整理します。

## Atomic Design との比較

### Atomic Design とは

Atomic Design は Brad Frost が提唱した、UIを化学の比喩で5段階に分類する手法です。

| 段階 | 内容 | 例 |
| --- | --- | --- |
| Atoms | それ以上分解できない最小のUI要素 | ラベル、入力欄、ボタン |
| Molecules | いくつかのAtomsが組み合わさり、ひとつの目的を果たす単位 | ラベル+入力欄+ボタン からなる検索フォーム |
| Organisms | Molecules や Atoms、他の Organisms が組み合わさった、比較的複雑なUIコンポーネント | ロゴ・ナビゲーション・検索フォームを含むヘッダー |
| Templates | 各要素をレイアウトへ配置し、ページの骨格を示すもの | 内容が入る前のページ構造 |
| Pages | Templatesに実際のコンテンツを入れたもの | 実データが入った完成画面 |

### 立っている場所が違う

分類の基準を比べる前に、2つの手法が**どこに立って UI を見ているか**を押さえます。

| | 立っている場所 | 答えようとしている問い |
| --- | --- | --- |
| Atomic Design | コンポーネントライブラリ | どのアプリでも使える部品を、どう組み立てて揃えるか |
| UI Boundary Architecture | アプリケーション実装 | この画面の責務をどこで切り、状態をどこに置くか |

**Atomic Design を実装へ当てはめようとしてうまくいかなかった経験があるなら、原因はここにあります。**

Atomic Design は、悩みの半分には答えています。部品が重複してきたときに、どう分類し、どう揃えるか。これはライブラリの問題であり、Atomic Design の守備範囲です。

答えていないのは残りの半分です。**ページ固有のUIをどこに置くか。状態をどこに置くか。** どちらもアプリケーション実装の問題であり、Atomic Design が立っている場所からは見えません。当てはまらなかったのではなく、**そこには答えが書かれていない**ということです。

この違いから、以降の相違点がほとんど導けます。

**Atomic Design が状態所有を扱わないのは、扱えないからです。** ライブラリの部品は、それを使うアプリがどんな状態を持つかを知りません。`Button` はどのアプリでも `Button` である必要があり、特定のアプリの状態を所有できません。状態所有が範囲外なのは、見落としではなく前提です。

同じ理由で、「この2つの機能は連動している」という関係もライブラリには持ち込めません。`Bridge` に相当するものがないのはそのためです(後述)。

### 重なっているのは Part と Component の帯だけ

2つの手法が同じ対象を見ているのは、`Part` と `Component` の範囲に限られます。

```text
コンポーネントライブラリの領分   アプリケーション実装の領分
──────────────────────────────   ──────────────────────────
Part / Component                 Island / Bridge / Scaffold
Atoms / Molecules                （Atomic Design に対応物なし）
```

この帯の中では、両方が同じ要素を別の観点で測ります(次節)。帯の外、つまり `Island` から上は、UI Boundary Architecture だけが扱います。

UI Boundary Architecture もこの帯を含んでいるので、**「Atomic Design はライブラリ専用、UI Boundary Architecture はアプリ専用」と切り分けられるわけではありません。** 帯の中では観点が2つあり、帯の外では片方しかない、という関係です。

この境目は、ディレクトリ構成の規則とも一致します。「`Part` は最初から共有領域に置ける」「`Island` は慎重に共有する」という第7章の規則は、**ライブラリになりうるものと、アプリ固有のものの線**を引いたものです(→ [第7章 ディレクトリ構成と共有](07-ProjectLayout.md))。

### 分類の基準が違う

Atomic Design が見ているのは、**合成の度合い**です。「これは何から組み立てられているか」で段階が決まります。Atoms がいくつか集まると Molecule になり、Molecules が集まると Organism になります。

UI Boundary Architecture が見ているのは、**責務と状態所有**です。「これは何に責任を持ち、どの状態を持つか」で単位が決まります。何から組み立てられているかは問いません。

この違いは、次のような場面で表面化します。

**大きいけれど表現しかしないもの。**
画面の大半を占める大きなグラフがあり、受け取ったデータを描画するだけだとします。Atomic Design では、内部に軸・凡例・目盛りといった複数の要素を含むため Organism に分類されます。UI Boundary Architecture では、外から受け取った情報を表現しているだけなので `Part` です。

**小さいけれど機能を持つもの。**
隅に置かれた小さな通知センターがあり、未読件数を取得し、既読処理を持つとします。Atomic Design では、要素数が少ないため Molecule 程度に見えます。UI Boundary Architecture では、独立した機能と状態を持つので `Island` です。

### 2つは直交する軸

ここまでを整理すると、2つの手法は**同じ対象を別の軸で測っている**ことが分かります。

- UI Boundary Architecture の軸 — **状態を持つか**(`Part` か `Component` か)
- Atomic Design の軸 — **何から組み立てられているか**(Atoms か Molecules か)

この2つは互いを制約しません。Molecule であっても、状態を持てば `Component`、持たなければ `Part` です。組み合わせると表になります。

|  | `Part`(状態を持たない) | `Component`(状態を持つ) |
| --- | --- | --- |
| Atoms 相当 | `Text` `Icon` `Divider` | `Button` `Checkbox` |
| Molecules 相当 | `Card` `Timestamp` | `SearchField` `Dropdown` |

**この見方をすると、Atomic Design は `Part` と `Component` の内側にある「大きさの目盛り」として使えます。**

UI Boundary Architecture は「大きさは基準ではない」と繰り返していて、**どこまで細かく分けるべきかには答えていません**(→ [第8章 分類に迷ったとき](08-Classification.md))。Atomic Design はまさにその問いに答える手法です。片方が空けている場所に、もう片方が入ります。

### この見方が成り立つ範囲

ただし、5段階すべてが目盛りとして働くわけではありません。

| Atomic Design | 目盛りとして使えるか |
| --- | --- |
| Atoms / Molecules | **使える。** `Part` と `Component` の内側の大きさを表す |
| Organisms | **半分。** 状態と機能を持って独立するなら、それは `Component` ではなく `Island` |
| Templates / Pages | **使えない。** `Scaffold` の話であり、大きさではなく画面の成立の話 |

Organisms が境目になるのは、UI Boundary Architecture がそこで**軸を切り替えている**からです。`Component` までは要素の性質(状態を持つか)で分け、`Island` からは機能の独立性(別の画面へ移して成立するか)で分けます。Atomic Design にはこの切り替えがなく、最後まで合成の度合いで進みます。

そのため、Organisms に分類されているものを見つけたら、**そこだけは大きさではなく機能で判定し直す**必要があります。

Templates と Pages が目盛りにならないのは、この2段階が **Atomic Design がライブラリからアプリケーションへ手を伸ばしている部分**だからです。手を伸ばしてはいますが、そこで扱っているのは配置と確認であって、状態所有ではありません。

### Templates / Pages と Scaffold の違い

Atomic Design の上位2段階は、`Scaffold` に近い位置にありますが、担っているものが違います。

**Templates** は、各要素をレイアウトへ配置し、ページの骨格を示すものです。実際のコンテンツはまだ入っていません。**Templates が扱うのは配置であって、状態ではありません。**

**Pages** は、Templates に実際のコンテンツを入れたものです。これは責務の分類ではなく、「実データで確認する段階」を指しています。

`Scaffold` は、配置に加えて**画面状態を所有します**。サイドバーが開いているか、どのタブが選択されているかを持ち、その変化に応じて配置を変えます。Templates にはこの役割がありません。

つまり、Templates を `Scaffold` に置き換えると、状態の所有者が1つ増えます。これは Atomic Design 側の不足ではなく、**そもそも状態所有を扱う手法ではない**ということです。

### 対応関係

おおよその対応は次のようになりますが、**1対1で対応するものではありません。**

| Atomic Design | 近い単位 | ずれ |
| --- | --- | --- |
| Atoms | `Part` | Atoms は「これ以上分解できない」が基準。`Part` は複数要素で構成されていてもよい |
| Molecules | `Part` / `Component` | 自分で状態を持つなら `Component`、持たないなら `Part` |
| Organisms | `Component` / `Island` | 状態を持ち機能として独立するなら `Island` |
| Templates | `Scaffold` | Templates は状態を持たない。`Scaffold` は画面状態を持つ |
| Pages | `Scaffold` の実体 | Pages は「実データを入れた状態」を指し、責務の分類ではない |

### 最大の違い: Bridge に相当するものがない

立っている場所の違いは、構造そのものにも現れます。

Atomic Design の5段階はすべて**含む・含まれる**の関係です。ある要素は必ず、より大きな要素の一部として存在します。

しかし「2つの Organism が同じ選択状態を共有している」という関係は、含む・含まれるでは表せません。共通の親である Template に持たせるしかなく、そうすると Template は「レイアウトの骨格」ではなくなります。

UI Boundary Architecture の `Bridge` は、この関係を表すために存在します。`Bridge` は描画構造に現れないため、含む・含まれるの関係とは独立に置けます(→ [第3章 論理構造と描画構造](03-Structure.md))。

### 併用できるか

できます。両者は競合しません。

- **Atomic Design** — 大きさの語彙。「この部品はどの粒度か」を、デザイナーと開発者が共有するために使う
- **UI Boundary Architecture** — 状態と責務の語彙。「この状態は誰が持つか」「この機能はどこまでか」を決めるために使う

先に示した表のとおり、この2つは直交します。**「Molecule で、状態を持つので `Component`」という言い方が成立します。** 片方を選ぶ必要はありません。

デザインシステム側で Atoms / Molecules として管理している部品を、実装側では `Part` / `Component` として配置する、という運用は成立します。ただし**両方の名前を同時に使うと会話が混乱する**ため、どちらの語彙で話しているかを明示してください。

すでに Atomic Design で分類されたコードがある場合の、具体的な進め方は [第6章 適用のしかた](06-Adoption.md) で扱います。既存の `atoms/` や `organisms/` を作り直す必要はありません。

## Islands Architecture との比較

### Islands Architecture とは

Islands Architecture は、Webページをサーバーで静的なHTMLとして生成し、**操作が必要な部分だけを個別に Hydration する**手法です。

**Hydration** とは、サーバーが返したHTMLに対して、ブラウザ側でJavaScriptを結び付け、操作可能な状態にする処理のことです。従来の手法ではページ全体を一度に Hydration するため、静的な文章しかない領域にも JavaScript を送ることになります。

Islands Architecture では、操作が必要な領域を「island」として切り出し、そこだけに JavaScript を送ります。残りの領域は静的なHTMLのままで、JavaScript は一切送られません。各 island は独立して Hydration されるため、片方の読み込みがもう片方を待たせることもありません。

この考え方は、2019年に Etsy のフロントエンドアーキテクトである Katie Sylor-Miller が「component island」と名付けたものです。2020年に Jason Miller が「Islands Architecture」として記事にまとめ、広まりました。Astro をはじめ、複数のフレームワークが実装しています。

### 目的が違う

| | Islands Architecture | UI Boundary Architecture |
| --- | --- | --- |
| 目的 | ブラウザへ送るJavaScriptを減らす | 責務と状態の所在を明確にする |
| 境界の基準 | 操作が必要か、静的か | 機能として独立しているか |
| 前提 | サーバーレンダリングを行うWeb | フレームワークと実行環境を問わない |
| 静的な領域 | island の外。JavaScript を送らない | どの単位かは責務で決まる |

Islands Architecture の island は、**配信の最適化**のための境界です。「ここから先はJavaScriptが要る」という線を引いています。

UI Boundary Architecture の `Island` は、**責務分割**のための境界です。「ここから先は別の機能である」という線を引いています。

### 共通しているもの

どちらも「独立して更新できる単位を切る」という発想を持っています。UI Boundary Architecture が `Island` という名前を借りているのはこのためです。

Islands Architecture では、ある island の Hydration が他の island に影響しません。UI Boundary Architecture では、ある `Island` の状態変化が他の `Island` の再描画に及びません。**独立した更新単位**という点で同じ形をしています。

### 併用できるか

できます。むしろ相性がよい部分があります。

Astro のようなフレームワークで実装する場合、island として切り出す領域と、UI Boundary Architecture の `Island` を一致させるのは自然な選択です。「独立した機能」は、たいてい「操作が必要な領域」でもあるからです。

ただし、**必ず一致するわけではありません。** 操作を一切受け付けない `Island` — たとえば定期的に更新されるだけの統計パネル — は、Islands Architecture の観点では island にする必要がないかもしれません。逆に、静的な記事本文の中に置かれた小さなコピーボタンは、island ではありますが、UI Boundary Architecture では `Component` です。

一致させるかどうかは、そのプロジェクトで配信の最適化をどこまで重視するかによります。

## 3つの手法のまとめ

| | Atomic Design | Islands Architecture | UI Boundary Architecture |
| --- | --- | --- | --- |
| 立っている場所 | コンポーネントライブラリ | ページの配信 | アプリケーション実装 |
| 分類の基準 | 合成の度合い | 操作の有無 | 責務と状態所有 |
| 主な目的 | どのアプリでも使える部品を揃える | 配信するJavaScriptを減らす | 状態と責務の所在を決める |
| 状態所有 | 扱わない | 扱わない | 中心的に扱う |
| 粒度(どこまで細かく分けるか) | **答える** | 扱わない | 扱わない |
| 協調関係の表現 | 含む・含まれるのみ | 扱わない | `Bridge` として表す |
| 適用範囲 | UI全般 | サーバーレンダリングを行うWeb | UI全般 |

粒度の行が、Atomic Design と UI Boundary Architecture を併用する理由です。**一方が答えている問いに、もう一方は答えていません。**

3つは同じ画面に対して**別々の問い**に答えています。競合しているように見えるのは、どれも「UIをどう分けるか」という形の話をしているからですが、分けている理由が違います。

## 参考

この章での要約が正確かどうかは、それぞれの一次情報で確認できます。

**Atomic Design**

- Brad Frost「Atomic Web Design」(2013年6月10日) — https://bradfrost.com/blog/post/atomic-web-design/
- Brad Frost『Atomic Design』(2016年。全文がWebで公開されています) — https://atomicdesign.bradfrost.com/

この章の5段階の定義は、書籍版の記述に沿っています。

**Islands Architecture**

- Jason Miller「Islands Architecture」(2020年8月11日) — https://jasonformat.com/islands-architecture/
- Astro ドキュメント「Islands architecture」 — https://docs.astro.build/en/concepts/islands/

---

← 前: [第4章 レスポンシブ設計](04-ResponsiveDesign.md) ・ [目次](README.md) ・ 次: [第6章 適用のしかた](06-Adoption.md) →
