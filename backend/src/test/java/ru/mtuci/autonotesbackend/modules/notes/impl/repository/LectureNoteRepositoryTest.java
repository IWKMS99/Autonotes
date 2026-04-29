package ru.mtuci.autonotesbackend.modules.notes.impl.repository;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import ru.mtuci.autonotesbackend.BaseIntegrationTest;
import ru.mtuci.autonotesbackend.modules.notes.impl.domain.LectureNote;
import ru.mtuci.autonotesbackend.modules.notes.impl.domain.NoteImage;
import ru.mtuci.autonotesbackend.modules.notes.impl.domain.NoteStatus;
import ru.mtuci.autonotesbackend.modules.user.impl.domain.User;
import ru.mtuci.autonotesbackend.modules.user.impl.repository.UserRepository;

class LectureNoteRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private LectureNoteRepository lectureNoteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void hardDeleteById_shouldPhysicallyDeleteRecord() {
        // Arrange
        User user = userRepository.save(User.builder()
                .username("del_user")
                .email("del@test.com")
                .password("pass")
                .build());

        LectureNote note = LectureNote.builder()
                .user(user)
                .title("To Delete")
                .status(NoteStatus.COMPLETED)
                .build();

        note.addImage(NoteImage.builder()
                .originalFileName("file.jpg")
                .fileStoragePath("path/del")
                .orderIndex(0)
                .build());

        lectureNoteRepository.save(note);
        Long noteId = note.getId();

        // Act
        lectureNoteRepository.hardDeleteById(noteId);

        entityManager.clear();

        // Assert
        assertThat(lectureNoteRepository.findById(noteId)).isEmpty();

        Integer count =
                jdbcTemplate.queryForObject("SELECT count(*) FROM lecture_notes WHERE id = ?", Integer.class, noteId);
        assertThat(count).isEqualTo(0);
    }
}
