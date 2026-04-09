import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { COLORS } from '../../themes/themes';
import { useTheme } from '../../Context/ThemeContext';

const ResendTimer = ({
  activeResend,
  resendingEmail,
  resendStatus,
  timeLeft,
  targetTime,
  resendEmail,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        alignContent: 'center',
        alignSelf: 'center',
      }}
    >
      <Text style={{ color: theme?.text, fontSize: 14, fontWeight: '700' }}>
        Didn't get the code?
      </Text>
      {!resendingEmail && (
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!activeResend}
          style={{ opacity: !activeResend && 0.5 }}
          onPress={resendEmail}
        >
          <Text
            resendStatus={resendStatus}
            style={{ textDecorationLine: 'underline' }}
          >
            {resendStatus}
          </Text>
        </TouchableOpacity>
      )}

      {resendingEmail && (
        <TouchableOpacity activeOpacity={0.9} disabled>
          <ActivityIndicator color="white" />
        </TouchableOpacity>
      )}

      {!activeResend && (
        <View>
          <Text
            style={{
              color: '#ccc',
              fontSize: 14,
              fontWeight: '700',
              marginLeft: 10,
              opacity: !activeResend && 0.5,
            }}
          >
            Resend in{' '}
            <Text style={{ color: COLORS.legacyBridgePrimary }}>
              {timeLeft || targetTime}
            </Text>
          </Text>
        </View>
      )}

      {activeResend && (
        <TouchableOpacity activeOpacity={0.9} onPress={resendEmail}>
          <Text
            style={{
              color: COLORS.legacyBridgePrimary,
              fontSize: 14,
              fontWeight: '700',
              marginLeft: 10,
            }}
          >
            Resend
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ResendTimer;

const styles = StyleSheet.create({});
