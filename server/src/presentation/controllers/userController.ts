import { Router, Response } from 'express';
import { UserManagementService } from '../../application/UserManagementService.js';
import { UserGroupService } from '../../application/UserGroupService.js';
import { SQLiteUserRepository } from '../../infrastructure/database/UserRepository.js';
import { SQLiteUserProfileRepository } from '../../infrastructure/database/UserProfileRepository.js';
import { SQLiteUserGroupRepository } from '../../infrastructure/database/UserGroupRepository.js';
import { SQLiteRoleRepository } from '../../infrastructure/database/RoleRepository.js';
import { authMiddleware, requirePermission, AuthRequest } from '../middleware/auth.js';

const router = Router();

function createServices() {
  const userRepo = new SQLiteUserRepository();
  const profileRepo = new SQLiteUserProfileRepository();
  const groupRepo = new SQLiteUserGroupRepository();
  const roleRepo = new SQLiteRoleRepository();
  return {
    userService: new UserManagementService(userRepo, profileRepo, groupRepo, roleRepo),
    groupService: new UserGroupService(groupRepo),
  };
}

router.use(authMiddleware);

// ─── User CRUD ──────────────────────────────────────────────

router.get('/', requirePermission('user:read'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  const { query, isActive, role, groupId, offset, limit } = req.query as Record<string, string | undefined>;
  const users = userService.listUsers({
    query,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    role,
    groupId,
    offset: offset ? parseInt(offset, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });
  const total = userService.countUsers({
    query,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    role,
    groupId,
  });
  res.json({ data: users, total });
});

router.get('/:id', requirePermission('user:read'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  const user = userService.getUser(req.params.id);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

router.put('/:id', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  try {
    const user = userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    const status = msg.includes('not found') ? 404 : 400;
    res.status(status).json({ error: msg });
  }
});

router.delete('/:id', requirePermission('user:delete'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  try {
    userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Delete failed';
    res.status(404).json({ error: msg });
  }
});

// ─── User Status ────────────────────────────────────────────

router.post('/:id/activate', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  try {
    const user = userService.activateUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Activate failed' });
  }
});

router.post('/:id/deactivate', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  try {
    const user = userService.deactivateUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Deactivate failed' });
  }
});

// ─── Roles ──────────────────────────────────────────────────

router.get('/:id/roles', requirePermission('user:read'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  const roles = userService.getUserRoles(req.params.id);
  res.json({ roles });
});

router.post('/:id/roles', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  try {
    userService.assignRole(req.params.id, req.body.role);
    const roles = userService.getUserRoles(req.params.id);
    res.json({ roles });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Assign role failed';
    res.status(404).json({ error: msg });
  }
});

router.delete('/:id/roles/:role', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  userService.removeRole(req.params.id, req.params.role);
  res.json({ roles: userService.getUserRoles(req.params.id) });
});

// ─── User Groups ────────────────────────────────────────────

router.get('/:id/groups', requirePermission('user:read'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  const groups = userService.getUserGroups(req.params.id);
  res.json({ data: groups });
});

router.post('/:id/groups/:groupId', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  try {
    userService.addUserToGroup(req.params.id, req.params.groupId);
    res.status(201).json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed';
    res.status(404).json({ error: msg });
  }
});

router.delete('/:id/groups/:groupId', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { userService } = createServices();
  userService.removeUserFromGroup(req.params.id, req.params.groupId);
  res.json({ ok: true });
});

// ─── Group Management ───────────────────────────────────────

router.get('/groups/all', requirePermission('user:read'), (req: AuthRequest, res: Response) => {
  const { groupService } = createServices();
  const groups = groupService.listGroups();
  res.json({ data: groups });
});

router.post('/groups', requirePermission('user:create'), (req: AuthRequest, res: Response) => {
  const { groupService } = createServices();
  try {
    const group = groupService.createGroup(req.body);
    res.status(201).json(group);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Create failed';
    const status = msg.includes('already exists') ? 409 : 400;
    res.status(status).json({ error: msg });
  }
});

router.put('/groups/:id', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { groupService } = createServices();
  try {
    const group = groupService.updateGroup(req.params.id, req.body);
    res.json(group);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    const status = msg.includes('not found') ? 404 : msg.includes('already exists') ? 409 : 400;
    res.status(status).json({ error: msg });
  }
});

router.delete('/groups/:id', requirePermission('user:delete'), (req: AuthRequest, res: Response) => {
  const { groupService } = createServices();
  try {
    groupService.deleteGroup(req.params.id);
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Group not found' });
  }
});

router.post('/groups/:id/toggle', requirePermission('user:update'), (req: AuthRequest, res: Response) => {
  const { groupService } = createServices();
  try {
    const group = groupService.toggleGroupActive(req.params.id, req.body.isActive);
    res.json(group);
  } catch {
    res.status(404).json({ error: 'Group not found' });
  }
});

export default router;
