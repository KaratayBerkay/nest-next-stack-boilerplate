import 'package:flutter/material.dart';

const List<DropdownMenuItem<String>> categoryItems = [
  DropdownMenuItem(value: 'all', child: Text('All Categories')),
  DropdownMenuItem(value: 'tech', child: Text('Technology')),
  DropdownMenuItem(value: 'design', child: Text('Design')),
  DropdownMenuItem(value: 'business', child: Text('Business')),
  DropdownMenuItem(value: 'marketing', child: Text('Marketing')),
];

const List<DropdownMenuItem<String>> sortItems = [
  DropdownMenuItem(value: 'newest', child: Text('Newest First')),
  DropdownMenuItem(value: 'oldest', child: Text('Oldest First')),
  DropdownMenuItem(value: 'popular', child: Text('Most Popular')),
  DropdownMenuItem(value: 'relevance', child: Text('Relevance')),
];

const List<DropdownMenuItem<String>> statusItems = [
  DropdownMenuItem(value: 'all', child: Text('All Statuses')),
  DropdownMenuItem(value: 'active', child: Text('Active')),
  DropdownMenuItem(value: 'pending', child: Text('Pending')),
  DropdownMenuItem(value: 'archived', child: Text('Archived')),
];

const List<String> tagOptions = [
  'Flutter',
  'React',
  'Node.js',
  'Python',
  'Design',
  'API',
  'Database',
  'DevOps',
];
