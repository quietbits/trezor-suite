import { useNavigation } from '@react-navigation/native';

import { Box, Text, Image, TrezorSuiteLiteHeader } from '@suite-native/atoms';
import {
    OnboardingStackParamList,
    OnboardingStackRoutes,
    Screen,
    StackNavigationProps,
} from '@suite-native/navigation';
import { Icon } from '@suite-common/icons';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { useActiveColorScheme } from '@suite-native/theme';

import { OnboardingFooter } from '../components/OnboardingFooter';

const titleStyle = prepareNativeStyle(_ => ({
    maxWidth: '60%',
    textAlign: 'center',
    marginBottom: 12,
}));

const imageContainerStyle = prepareNativeStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
}));

export const WelcomeScreen = () => {
    const navigation =
        useNavigation<
            StackNavigationProps<OnboardingStackParamList, OnboardingStackRoutes.Welcome>
        >();
    const { applyStyle } = useNativeStyles();
    const colorScheme = useActiveColorScheme();

    const handleRedirect = () => {
        navigation.navigate(OnboardingStackRoutes.TrackBalances);
    };

    const getImageSource = () => {
        if (colorScheme === 'dark') {
            return require('../assets/darkRectangles.png');
        }
        return require('../assets/rectangles.png');
    };

    return (
        <>
            <Screen isScrollable={false}>
                <Box flex={1} justifyContent="space-between" alignItems="center">
                    <Box flex={0.75} />
                    <Box alignItems="center" flex={1}>
                        <Box alignItems="center">
                            <Box marginBottom="large">
                                <Icon size="extraLarge" name="trezor" color="iconDefault" />
                            </Box>
                            <Text variant="titleMedium" style={applyStyle(titleStyle)}>
                                Welcome to <TrezorSuiteLiteHeader textVariant="titleMedium" />
                            </Text>
                        </Box>
                        <Text color="textSubdued" textAlign="center">
                            Simple and secure portfolio tracker
                        </Text>
                    </Box>
                    <OnboardingFooter redirectTarget={handleRedirect} />
                </Box>
            </Screen>
            <Box style={applyStyle(imageContainerStyle)}>
                <Image source={getImageSource()} resizeMode="contain" />
            </Box>
        </>
    );
};
