import 'package:flutter_test/flutter_test.dart';
import 'package:heavyrent_customer/main.dart';

void main() {
  testWidgets('App launches', (WidgetTester tester) async {
    await tester.pumpWidget(const HeavyRentApp());
    expect(find.text('HeavyRent'), findsOneWidget);
  });
}
