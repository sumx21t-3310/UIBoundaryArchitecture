# UI Boundary Architecture

## 概要

UI Boundary Architectureは、UIを見た目の大きさではなく、**責務と状態所有の境界**によって分割する設計手法です。

基本となる単位は次の5つです。

```text
Scaffold
└─ Bridge
   └─ Island
      └─ Component
         └─ Part
```

| 単位 | 境界 | 主な責務 |
| --- | --- | --- |
| Scaffold | Screen Boundary | 画面構造と画面状態 |
| Bridge | Coordination Boundary | 複数Islandの協調 |
| Island | Feature Boundary | 機能とその状態 |
| Component | Interaction Boundary | 操作と振る舞い |
| Part | Presentation Boundary | 表現 |

この階層は、UIのサイズや複雑さを表すものではありません。

「この責務はどこまでか」「この状態を誰が所有するか」を明確にするための分類です。

---

## 全体像

たとえば、メール画面は次のように分割できます。

```text
MailScaffold
└─ MailSelectionBridge
   ├─ MailListIsland
   │  ├─ SearchField
   │  └─ MailList
   │
   └─ MailPreviewIsland
      ├─ MailHeader
      └─ MailBody
```

`MailScaffold` は画面全体を成立させます。

`MailListIsland` と `MailPreviewIsland` は、それぞれ独立した機能と状態を持ちます。

両方のIslandで必要になる「現在選択されているメール」は、`MailSelectionBridge` が管理します。

---

## Scaffold

Scaffoldは、**ひとつの画面を成立させる境界**です。

画面全体の構造と、画面単位で意味を持つ状態を管理します。

```text
ProjectScaffold
├─ Navigation
├─ MainContent
└─ Inspector
```

Scaffoldが持つ状態には、たとえば次のようなものがあります。

```text
SelectedTab
IsSidebarOpen
CurrentViewMode
```

ScaffoldはIslandを画面上へ配置し、画面全体のライフサイクルを管理します。

特定のIsland同士だけで必要になる協調状態までScaffoldへ集める必要はありません。そのような責務はBridgeへ分離します。

---

## Bridge

Bridgeは、**複数のIslandを協調させる論理的な境界**です。

共有状態や、Island間の関係を管理します。

Bridge自身にはレイアウト能力がなく、視覚的な表現も持ちません。

```text
Logical Structure

Scaffold
└─ SelectionBridge
   ├─ ListIsland
   └─ DetailIsland
```

レンダリング上では、Bridgeは構造として現れません。

```text
Visual Structure

Scaffold
├─ ListIsland
└─ DetailIsland
```

たとえば一覧と詳細の両方から参照される `SelectedItemId` は、どちらか一方のIslandではなくBridgeが所有できます。

```text
SelectionBridge
├─ SelectedItemId
├─ ListIsland
└─ DetailIsland
```

Scaffoldが**空間を構成するもの**なら、Bridgeは**関係を構成するもの**です。

---

## Island

Islandは、**ひとつの機能とその状態をまとめる境界**です。

```text
KanbanIsland
├─ KanbanState
├─ ColumnComponent
└─ TaskCardComponent
```

Island内部の状態変更は、可能な限りそのIsland内で完結させます。

そのためIslandは、機能分割だけでなく、状態管理やリアクティブ更新の境界として利用できます。

```text
ProjectScaffold
├─ KanbanIsland     ← 更新
├─ ActivityIsland
└─ ChatIsland
```

Kanbanの状態だけが変化した場合、ActivityやChatまで同じ更新境界に含める必要はありません。

Islandという名前は、WebにおけるIslands ArchitectureのHydration境界から着想を得ています。

UI Boundary Architectureでは、Islandを**機能と状態の独立境界**として扱います。

---

## Component

Componentは、**ユーザーとのインタラクションや振る舞いを表す境界**です。

```text
Button
Checkbox
TextField
Dropdown
Slider
```

Componentは、UIとして意味のある内部状態を持つことがあります。

ただし、「内部に状態変数が存在するか」だけでComponentを判定するわけではありません。

アニメーションやキャッシュなどの実装上の状態ではなく、**UIとして意味のある振る舞いを提供するか**を基準にします。

---

## Part

Partは、**UIの表現を担当する境界**です。

```text
Text
Icon
Divider
Badge
Avatar
```

基本的には外部から受け取った情報を、描画・装飾・配置として表現します。

Partが内部的にアニメーション状態やキャッシュを持つことは許容されます。

そのため、

```text
Part = Stateless
```

ではなく、

```text
Part = Presentation
```

と考えます。

---

## State Ownership

Stateは、それを必要とするUIの**もっとも狭い適切な境界**が所有します。

```text
Application
    ↓
Scaffold
    ↓
Bridge
    ↓
Island
    ↓
Component
```

ひとつのComponentだけで必要ならComponentが所有します。

Island全体で必要ならIslandが所有します。

複数Islandで共有するならBridgeが所有します。

画面全体で意味を持つならScaffoldが所有します。

この考え方により、Stateの配置をUI構造と同じ語彙で判断できます。

---

## Responsive Design

レスポンシブ対応も、**どの境界の構造が変化するか**によって責務を決めます。

### Island内部のレスポンシブ

ひとつのIslandの内部だけでレイアウトが変化する場合、そのIsland自身が責務を持ちます。

たとえばKanbanが、利用可能な横幅に応じて列の配置を変更するとします。

```text
Wide

KanbanIsland
[ Todo ][ Doing ][ Done ]
```

```text
Narrow

KanbanIsland
[ Todo  ]
[ Doing ]
[ Done  ]
```

機能そのものや他のIslandとの関係は変わっていません。

変化しているのはKanbanIsland内部の表現だけなので、Scaffoldがその詳細を知る必要はありません。

Islandは、自身に与えられた利用可能領域に応じて内部構造を適応できます。

### Island間のレスポンシブ

複数Islandの位置、表示方法、可視性などが変化する場合は、Scaffoldが責務を持ちます。

たとえばデスクトップでは、一覧と詳細を横に表示するとします。

```text
Desktop

MailScaffold
┌────────────────┬────────────────────┐
│ MailListIsland │ MailPreviewIsland  │
└────────────────┴────────────────────┘
```

モバイルでは、一覧を通常表示し、詳細を別の表示領域へ切り替えることがあります。

```text
Mobile

MailScaffold
┌─────────────────────┐
│ MailListIsland      │
└─────────────────────┘

MailPreviewIsland
→ Page / Sheet / Overlay
```

この場合、`MailPreviewIsland` 自身の機能は変わっていません。

変化しているのは、**Islandが画面上でどのように構成されるか**です。

そのためScaffoldが判断します。

基本的な境界は次のようになります。

```text
Island内部の変化
→ Island

Island同士の空間的な関係の変化
→ Scaffold
```

### Bridgeはレスポンシブレイアウトを扱わない

Bridgeは論理的な協調境界なので、画面サイズに応じた配置変更は担当しません。

たとえば、

```text
MailSelectionBridge
├─ MailListIsland
└─ MailPreviewIsland
```

という関係は、デスクトップでもモバイルでも維持できます。

デスクトップでは2つのIslandが並んでいて、

```text
[ List ][ Preview ]
```

モバイルでは別々の場所に表示されていても、

```text
[ List ]

Preview → Overlay
```

`SelectedMailId` を共有するという論理的な関係は同じです。

つまり、

> **Bridgeは論理的な関係を構成し、Scaffoldは空間的な関係を構成する。**

レスポンシブによって見た目の構造が変化しても、機能間の関係まで変更する必要はありません。

---

## Visual Structure と Logical Structure

UI Boundary Architectureでは、論理的な構造とレンダリング上の構造が必ずしも一致しません。

特にBridgeはその代表です。

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

レスポンシブ対応によってVisual Structureが変化しても、Logical Structureは維持できます。

```text
Wide

Scaffold
├─ Island A
└─ Island B
```

```text
Narrow

Scaffold
├─ Island A
└─ Overlay
   └─ Island B
```

この場合でも、

```text
Bridge
├─ Island A
└─ Island B
```

という論理関係は変わりません。

UI Boundary Architectureの階層は、そのまま描画ツリーを表すものではなく、**状態・責務・協調関係を含めた論理的なUI構造**を表します。

---

## ディレクトリ構成

実装では、まず**ページ単位でディレクトリを分けます**。

Scaffold、Bridge、Island、Componentは、原則としてそのページの内部から始めます。

```text
pages/
├─ project/
│  ├─ ProjectScaffold
│  ├─ bridges/
│  │  └─ TaskSelectionBridge
│  ├─ islands/
│  │  ├─ KanbanIsland
│  │  └─ TaskDetailIsland
│  └─ components/
│     ├─ TaskCard
│     └─ ColumnHeader
│
└─ settings/
   ├─ SettingsScaffold
   └─ islands/
      ├─ AccountIsland
      └─ AppearanceIsland
```

すべてのページに同じディレクトリを機械的に作る必要はありません。

重要なのはディレクトリ構成そのものではなく、**どのページの責務として存在するか**を明確にすることです。

---

## Shared

Component以上の要素は、まずページローカルから始めます。

複数ページから実際に利用されるようになった段階で、共有領域へ昇格させます。

```text
Page Local
    ↓
複数ページから利用される
    ↓
Shared
```

### Partは共有から始めてもよい

Partは機能ではなく表現を担当するため、ページ固有の文脈へ依存しにくい性質があります。

そのため、汎用的なPartは最初から共有領域に配置できます。

```text
shared/
└─ parts/
   ├─ Text
   ├─ Icon
   ├─ Avatar
   ├─ Badge
   └─ Divider
```

一方、ドメイン固有の表現まで無理に共有する必要はありません。

```text
汎用的な表現
→ shared/parts

ページ・ドメイン固有の表現
→ Page Local
```

Component以上はページローカルから始め、再利用が明確になった段階で共有領域へ昇格します。

---

## 分類に迷ったとき

UIの大きさではなく、何の境界を作っているかで判断します。

```text
Part
「どう見えるか」

Component
「どう操作できるか」

Island
「この機能は何を管理するか」

Bridge
「複数の機能はどう協調するか」

Scaffold
「この画面をどう成立させるか」
```

レスポンシブ対応では、次の問いを追加できます。

```text
この要素の内部だけが変わるか？
→ その要素自身

複数Islandの配置関係が変わるか？
→ Scaffold

Island同士の論理関係が変わるか？
→ Bridge
```

階層が上だから必ず大きい、という関係ではありません。

UI Boundary Architectureが表すのは、UIの物理的な粒度ではなく、**責務と状態所有の境界**です。