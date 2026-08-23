<template>
    <section class="home-main">
        <nav>
            <div class="logo-box-home">
                <div>
                    <img src="../assets/img/logo-blue.png" alt="logo" />
                </div>
                <p>Tasko</p>
            </div>
            <div>
                <a @click.stop.prevent="goTologin" href="#">Log in</a>
                <button @click="goToSignup">Sign up</button>
            </div>
        </nav>
        <div class="home-main-box">
            <div class="img-txt">
                <div class="txt-box">
                    <div>
                        <h1>Tasko helps teams move work forward.</h1>
                        <p>
                            Collaborate, manage projects,
                            and reach new productivity peaks. From high rises to the home office,
                            the way your team works is unique—accomplish it all with Tasko.
                        </p>
                    </div>
                    <div class="input-mail-box">
                        <!-- <input name="email" type="email" placeholder="Email" /> -->
                        <button type="submit" @click.stop.prevent="goToBoards">Let's start</button>
                    </div>
                </div>
                <div class="img-box">
                    <img src="../assets/img/hero-home-page.png" alt="hero" />
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { userService } from '../services/user.service.js'
export default {

    data() {
        return {
            user: {
                username: 'Guest-user',
                password: '123',
            },
        }
    },
    created() {
        // Only drop visitors into the guest account if nobody is already
        // logged in - otherwise landing back on "/" (e.g. clicking the logo)
        // silently clobbers a real session with the guest one.
        if (userService.getLoggedinUser()) return
        this.$store.dispatch({ type: 'login', user: this.user })
    },
    computed: {

    },
    methods: {
        goToSignup() {
            this.$router.push(`/signup`)
        },
        goTologin() {
            this.$router.push(`/login`)
        },
        goToBoards() {

            this.$router.push(`/board`)
        }
    },
    components: {
    },
}
</script>