import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationBadge = ({ count }) => {
  // Add logging to see what count value is being passed
  console.log('NotificationBadge - received count:', count);
  
  useEffect(() => {
    console.log('NotificationBadge - mounted with count:', count);
    return () => {
      console.log('NotificationBadge - unmounting with count:', count);
    };
  }, [count]);
  
  if (!count || count <= 0) {
    console.log('NotificationBadge - not rendering (count <= 0)');
    return null;
  }
  
  console.log('NotificationBadge - rendering with count:', count);
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
