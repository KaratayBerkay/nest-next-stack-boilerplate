import '../../components/ui/page_info/page_info.dart';

const sharePageInfo = PageInfoContent(
  title: 'Share',
  description: 'Create and publish a new post to your feed.',
  sections: [
    PageInfoSection(
      title: 'Creating a Post',
      description:
          'Write your post content in the text area. You can share thoughts, updates, or interesting links.',
    ),
    PageInfoSection(
      title: 'Publishing',
      description:
          "When you're ready, tap the Share button to publish your post. It will appear in your followers' feeds.",
    ),
  ],
  tips: ['Keep posts concise for better engagement'],
);
