import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/components/feed/post_header.dart';
import 'package:flutter_boilerplate/constants/theme.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/types/feed/post.dart';
import 'package:flutter_boilerplate/types/feed/reaction.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> pumpHeader(WidgetTester tester, Post post) async {
  await tester.pumpWidget(
    MaterialApp(
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: const [Locale('en'), Locale('tr')],
      theme: buildThemeData(AppThemeMode.light),
      home: Scaffold(
        // A fairly narrow card width — this is where MOB-035 reproduced
        // even on a wide 1080px-class phone once real reaction chips were
        // in play alongside the view/edit/delete icon buttons.
        body: SizedBox(
          width: 320,
          child: PostHeader(
            postData: post,
            isOwn: true,
            currentUserId: 'me',
            onViewPost: () {},
            onEditStart: () {},
            onDeleteConfirm: () {},
          ),
        ),
      ),
    ),
  );
  await tester.pump();
}

void main() {
  // Regression (MOB-035): the instant any reaction existed, the header's
  // trailing Row (reaction chips + view/edit/delete icon buttons) had no
  // bound on its width and overflowed the card, clipping the author name.
  testWidgets('does not overflow once reactions exist, with a long name',
      (tester) async {
    final post = Post(
      id: 'post-1',
      title: 't',
      content: 'c',
      authorName: 'A Fairly Long Test Author Name',
      authorId: 'author-1',
      likeCount: 0,
      commentCount: 0,
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      reactions: const [
        FeedReaction(type: 'LIKE', userId: 'u1'),
        FeedReaction(type: 'LOVE', userId: 'u2'),
        FeedReaction(type: 'LAUGH', userId: 'u3'),
        FeedReaction(type: 'WOW', userId: 'u4'),
      ],
    );

    await pumpHeader(tester, post);

    expect(tester.takeException(), isNull);
  });

  // Regression: previously all 4 reaction-type chips rendered unconditionally
  // once any reaction existed — this both wasted the width that caused the
  // overflow above and showed emoji types nobody actually reacted with.
  testWidgets('only renders chips for reaction types actually used',
      (tester) async {
    final post = Post(
      id: 'post-1',
      title: 't',
      content: 'c',
      authorName: 'Test User',
      authorId: 'author-1',
      likeCount: 0,
      commentCount: 0,
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      reactions: const [FeedReaction(type: 'LIKE', userId: 'u1')],
    );

    await pumpHeader(tester, post);

    expect(find.text('\u{1F44D}'), findsOneWidget); // LIKE chip present
    expect(find.text('\u{1F602}'), findsNothing); // LAUGH chip absent
    expect(find.text('\u{2764}\u{FE0F}'), findsNothing); // LOVE chip absent
    expect(find.text('\u{1F62E}'), findsNothing); // WOW chip absent
  });
}
