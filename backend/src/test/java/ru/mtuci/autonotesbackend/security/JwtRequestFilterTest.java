package ru.mtuci.autonotesbackend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.servlet.HandlerExceptionResolver;
import ru.mtuci.autonotesbackend.config.logging.LogContextKeys;

@ExtendWith(MockitoExtension.class)
class JwtRequestFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private HandlerExceptionResolver resolver;

    @Mock
    private FilterChain filterChain;

    @Test
    void shouldPutAndClearUserInMdcWhenTokenValid() throws ServletException, IOException {
        JwtRequestFilter filter = new JwtRequestFilter(jwtService, userDetailsService, resolver);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        UserDetails userDetails = new User("demo", "x", List.of(new SimpleGrantedAuthority("ROLE_USER")));

        when(jwtService.extractUsername("token")).thenReturn("demo");
        when(userDetailsService.loadUserByUsername("demo")).thenReturn(userDetails);
        when(jwtService.isTokenValid("token", userDetails)).thenReturn(true);

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(any(), any());
        assertThat(MDC.get(LogContextKeys.MDC_USER)).isNull();
    }

    @Test
    void shouldResolveJwtExceptionAndNotContinueChain() throws ServletException, IOException {
        JwtRequestFilter filter = new JwtRequestFilter(jwtService, userDetailsService, resolver);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.extractUsername("token")).thenThrow(new JwtException("invalid"));

        filter.doFilter(request, response, filterChain);

        verify(resolver).resolveException(eq(request), eq(response), eq(null), any(JwtException.class));
        verify(filterChain, never()).doFilter(any(), any());
    }
}
