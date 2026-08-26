---
title: 第3章 論理構造と描画構造
description: 責務の構造と画面上の見え方が一致しない理由を説明します
---

UI Boundary Architecture では、**論理構造(Logical Structure)**と**描画構造(Visual Structure)**が必ずしも一致しません。

- **論理構造** — 責務・状態・協調の関係で表した構造
- **描画構造** — 画面上の見え方を決める構造

この2つを分けて考えることが、この手法の中心にあります。

## Bridge がその代表

```text
Logical Structure

Scaffold
└─ Bridge
   ├─ Island A
   └─ Island B
```

```text
Visual Structure

Scaffold
├─ Island A
└─ Island B
```

論理構造では `Bridge` が `Island A` と `Island B` を束ねています。描画構造では `Bridge` は現れず、2つの `Island` が `Scaffold` の直下に並びます。

`Bridge` は実装上、状態を配る仕組みとして存在します。しかし画面上の場所は占めません。

### コードには書かれるが、描画構造には現れない

ここで一度、言葉の意味をはっきりさせておきます。

`Bridge` を実装すると、多くのフレームワークでは Provider のようなラッパーとして書かれます。つまり**コード上は、2つの `Island` を囲む要素として確かに存在します。**

```text
<TaskSelectionBridge>
  <KanbanIsland />
  <TaskDetailIsland />
</TaskSelectionBridge>
```

それでも「描画構造には現れない」と言えるのは、**この要素がレイアウトに一切影響しないから**です。幅も高さも持たず、余白も枠線も背景も持たず、子をどう並べるかも決めません。ブラウザの開発者ツールで見たとき、そこに対応する矩形はありません。

この文書で「描画構造」と呼んでいるのは、**画面上の見え方を決める構造**であって、コードの入れ子の形ではありません。`Bridge` はコードには現れ、見え方には現れません。

## 描画構造が変わっても、論理構造は変わらない

画面が広いとき、2つの `Island` は横に並びます。

```text
Wide

Scaffold
├─ Island A
└─ Island B
```

画面が狭いとき、`Island B` はオーバーレイの中へ移ります。

```text
Narrow

Scaffold
├─ Island A
└─ Overlay
   └─ Island B
```

描画構造は変わりました。`Island B` の親が `Scaffold` から `Overlay` に変わっています。

しかし、この場合でも、

```text
Bridge
├─ Island A
└─ Island B
```

という論理関係は変わりません。2つの `Island` が選択状態を共有しているという事実は、画面の広さとは無関係だからです。

## なぜ分けるのか

論理構造と描画構造を同じものとして扱うと、**描画の都合が責務の分割を壊します。**

たとえば「`Island B` をオーバーレイに入れる」という描画上の変更が、`Island A` と `Island B` の共有状態の置き場所まで変えることになります。オーバーレイは `Scaffold` の直下に置かれるため、共通の親は `Scaffold` になり、共有状態も `Scaffold` へ移ります。画面幅が変わるたびに状態の所有者が変わる、という設計になってしまいます。

論理構造を独立して保つと、この連鎖が起きません。`Bridge` が状態を持ち続け、`Island B` がどこに描画されようと、同じ `Bridge` から値を受け取ります。

## この並びは描画構造ではない

冒頭で示した

```text
Scaffold
└─ Bridge
   └─ Island
      └─ Component
         └─ Part
```

という並びは、そのまま描画構造を表すものではありません。

- `Bridge` は描画構造に現れません
- `Island` が別の `Island` を含むことも、`Scaffold` が `Component` を直接置くこともあります
- レスポンシブ対応によって、描画構造の親子関係は入れ替わります

この並びが表しているのは、**状態・責務・協調関係を含めた論理的なUI構造**です。
