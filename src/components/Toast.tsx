import { View, Text, StyleSheet } from 'react-native';
import ToastLib, { BaseToastProps } from 'react-native-toast-message';
import Svg, { Path } from 'react-native-svg';

function CheckCircle() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="#fff" strokeWidth={1.8} />
    </Svg>
  );
}

function ErrorCircle() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="#fff" strokeWidth={1.8} />
      <Path d="M12 8v5M12 16h.01" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

const toastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.container, styles.success]}>
      <CheckCircle />
      <View style={styles.textWrap}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.container, styles.error]}>
      <ErrorCircle />
      <View style={styles.textWrap}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

export { toastConfig };
export default ToastLib;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  success: {
    backgroundColor: '#2D8A54',
  },
  error: {
    backgroundColor: '#C4837A',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#fff',
    letterSpacing: -0.1,
  },
  message: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});